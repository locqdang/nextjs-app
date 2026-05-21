import jwt from 'jsonwebtoken';
import { findOne, insertOne, updateOne } from '../../../lib/data/haro';

const JWT_SECRET = process.env.JWT_SECRET;
const MAILBOX_COLLECTION = 'mailbox_connections';
const ALLOWED_STATUSES = new Set(['active', 'inactive']);
const ALLOWED_EXPERTISE_VALUES = [
  'Analytics',
  'Advertising',
  'Artificial Intelligence / Data / Tech',
  'B2B',
  'Content Marketing',
  'CRO',
  'Customer Support + Experience',
  'DTC',
  'Ecommerce',
  'Education',
  'Email',
  'Entrepreneurship',
  'Finance',
  'HR',
  'Insurance',
  'Legal',
  'Logistics',
  'Management + Operations',
  'Marketing (General)',
  'Media: Photography + Videography',
  'Retail',
  'SaaS',
  'Sales',
  'SEO',
  'Social Media',
  'Engineering / Manufacturing',
];
const ALLOWED_EXPERTISE_SET = new Set(ALLOWED_EXPERTISE_VALUES);

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function normalizeExpertiseItem(item) {
  return typeof item === 'string' ? item.trim() : '';
}

function parseExpertise(expertise) {
  if (Array.isArray(expertise)) {
    return expertise.map(normalizeExpertiseItem).filter(Boolean);
  }

  if (typeof expertise === 'string') {
    try {
      const parsed = JSON.parse(expertise);
      return Array.isArray(parsed) ? parsed.map(normalizeExpertiseItem).filter(Boolean) : [];
    } catch {
      return expertise.split(',').map(normalizeExpertiseItem).filter(Boolean);
    }
  }

  return [];
}

function sanitizeExpertise(expertise) {
  const normalized = parseExpertise(expertise);
  return Array.from(new Set(normalized.filter((item) => ALLOWED_EXPERTISE_SET.has(item))));
}

function mapMailboxToResponse(connection, email) {
  if (!connection || connection.status !== 'connected') {
    return { status: 'disconnected' };
  }

  return {
    status: 'connected',
    connectedEmail: normalizeEmail(connection.connected_email) || email,
    connectedAt: connection.connected_at
      ? new Date(connection.connected_at).toISOString()
      : undefined,
  };
}

function mapDbProfileToResponse(profile, email) {
  if (!profile) {
    return null;
  }

  return {
    firstName: profile.expert_f_name || '',
    lastName: profile.expert_l_name || '',
    email: profile.expert_email || email,
    company: profile.expert_company || '',
    companyNiche: profile.expert_company_niche || '',
    website: profile.expert_company_website || '',
    jobTitle: profile.expert_job_title || '',
    bio: profile.expert_experience || '',
    expertise: sanitizeExpertise(profile.expert_expertise),
    linkedinUrl: profile.expert_linkedin_url || '',
    headshotUrl: profile.expert_headshot_url || '',
    signature: profile.expert_signature || '',
    status: profile.expert_status === 'inactive' ? 'inactive' : 'active',
  };
}

async function getMailboxConnection(email) {
  return findOne(MAILBOX_COLLECTION, { owner_email: email, provider: 'google' });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (!['GET', 'PUT'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const email = normalizeEmail(decoded.email);

    if (!email) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    if (req.method === 'GET') {
      const [dbProfile, mailboxConnection] = await Promise.all([
        findOne('profiles', { expert_email: email }),
        getMailboxConnection(email),
      ]);

      return res.status(200).json({
        profile: mapDbProfileToResponse(dbProfile, email),
        mailbox: mapMailboxToResponse(mailboxConnection, email),
        allowedExpertise: ALLOWED_EXPERTISE_VALUES,
      });
    }

    const {
      firstName = '',
      lastName = '',
      company = '',
      companyNiche = '',
      website = '',
      jobTitle = '',
      bio = '',
      expertise = [],
      linkedinUrl = '',
      headshotUrl = '',
      signature = '',
    } = req.body || {};

    const now = new Date();
    const existingProfile = await findOne('profiles', { expert_email: email });
    const existingStatus = existingProfile?.expert_status;
    const normalizedStatus =
      typeof existingStatus === 'string' ? existingStatus.trim().toLowerCase() : 'active';

    const nextProfile = {
      expert_email: email,
      expert_f_name: typeof firstName === 'string' ? firstName.trim() : '',
      expert_l_name: typeof lastName === 'string' ? lastName.trim() : '',
      expert_company: typeof company === 'string' ? company.trim() : '',
      expert_company_niche: typeof companyNiche === 'string' ? companyNiche.trim() : '',
      expert_company_website: typeof website === 'string' ? website.trim() : '',
      expert_job_title: typeof jobTitle === 'string' ? jobTitle.trim() : '',
      expert_experience: typeof bio === 'string' ? bio.trim() : '',
      expert_expertise: sanitizeExpertise(expertise),
      expert_linkedin_url: typeof linkedinUrl === 'string' ? linkedinUrl.trim() : '',
      expert_headshot_url: typeof headshotUrl === 'string' ? headshotUrl.trim() : '',
      expert_signature: typeof signature === 'string' ? signature.trim() : '',
      expert_status: ALLOWED_STATUSES.has(normalizedStatus) ? normalizedStatus : 'active',
      updatedAt: now,
    };

    if (existingProfile) {
      await updateOne('profiles', { expert_email: email }, nextProfile);
    } else {
      await insertOne('profiles', {
        ...nextProfile,
        createdAt: now,
      });
    }

    const [savedProfile, mailboxConnection] = await Promise.all([
      findOne('profiles', { expert_email: email }),
      getMailboxConnection(email),
    ]);

    return res.status(200).json({
      message: 'Profile saved successfully.',
      profile: mapDbProfileToResponse(savedProfile, email),
      mailbox: mapMailboxToResponse(mailboxConnection, email),
      allowedExpertise: ALLOWED_EXPERTISE_VALUES,
    });
  } catch (error) {
    console.error('HARO profile API error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
