import jwt from 'jsonwebtoken';
import { findMany, countDocuments, findOne } from '../../../lib/data/haro';
import { findOne as findAuthUser } from '../../../lib/data/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function toObjectId(id) {
  return typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
}

function queryIdVariants(id) {
  if (!id) return [];

  const variants = [id];
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    variants.push(new ObjectId(id));
  } else if (id instanceof ObjectId) {
    variants.push(id.toString());
  }

  return variants;
}

async function getQuerySourcesForMatches(matchFilter) {
  const matches = await findMany('matches', matchFilter, {
    projection: { query_id: 1 },
  });

  const queryIds = Array.from(
    new Set(matches.flatMap((match) => queryIdVariants(match.query_id)).map((id) => id.toString()))
  );

  if (queryIds.length === 0) return [];

  const queries = await findMany(
    'queries',
    {
      _id: {
        $in: queryIds.flatMap(queryIdVariants),
      },
    },
    {
      projection: { query_source: 1 },
    }
  );

  return Array.from(new Set(queries.map((query) => query.query_source).filter(Boolean))).sort();
}

async function addQuerySourceFilter(matchFilter, source) {
  if (!source) return;

  const queries = await findMany(
    'queries',
    { query_source: source },
    {
      projection: { _id: 1 },
    }
  );

  matchFilter.query_id = {
    $in: queries.flatMap((query) => queryIdVariants(query._id)),
  };
}

async function isAdminEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  // Intent: admin access must come from MongoDB server-side, never from the browser.
  const user = await findAuthUser('users', {
    email: normalizedEmail,
  });

  return user?.role === 'admin';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ error: 'Missing token' });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const source = String(req.query.source || '').trim();

    const decoded = jwt.verify(token, JWT_SECRET);
    const email = normalizeEmail(decoded.email);

    if (!email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = await isAdminEmail(email);

    const profile = await findOne('profiles', {
      expert_email: email,
    });

    if (!profile && !isAdmin) {
      return res.status(200).json({
        success: true,
        isAdmin: false,
        pitches: [],
        pagination: {
          currentPage: page,
          limit,
          totalPages: 0,
        },
      });
    }

    const filter = {
      pitch_time: {
        $exists: true,
        $nin: [''],
      },
    };

    if (!isAdmin) {
      const expertProfileId = profile._id.toString();

      if (!expertProfileId) {
        return res.status(400).json({ error: 'Profile is missing profile_id' });
      }

      // Intent: regular experts only see pitches tied to their authenticated profile.
      filter.profile_id = expertProfileId;
    }

    const sources = await getQuerySourcesForMatches(filter);

    // Intent: query source filtering is applied server-side within the authorized pitch scope.
    await addQuerySourceFilter(filter, source);

    const total = await countDocuments('matches', filter);
    const totalPages = Math.ceil(total / limit);

    const minified_pitches = await findMany('matches', filter, {
      sort: { pitch_time: -1 },
      limit,
      skip,
    });

    const pitches = await Promise.all(
      minified_pitches.map(async (p) => {
        const queryDoc = await findOne('queries', {
          _id: toObjectId(p.query_id),
        });
        // Strip createdAt and updatedAt from queryDoc
        const query = (() => {
          const { createdAt, updatedAt, ...rest } = queryDoc || {};
          return rest;
        })();

        const pitchProfileDoc = isAdmin
          ? await findOne('profiles', {
              _id: toObjectId(p.profile_id),
            })
          : profile;
        //  Strip createdAt and updatedAt from profileDoc
        const pitchProfile = (() => {
          const { createdAt, updatedAt, ...rest } = pitchProfileDoc || {};
          return rest;
        })();

        // Intent: admin view needs each pitch's owning expert profile, not the logged-in admin profile.
        return {
          ...p,
          ...query,
          ...pitchProfile,
          isAdminView: isAdmin,
        };
      })
    );

    return res.status(200).json({
      success: true,
      isAdmin,
      pitches,
      sources,
      selectedSource: source,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
