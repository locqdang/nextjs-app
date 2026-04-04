import jwt from "jsonwebtoken";
import { findMany, countDocuments, findOne } from "../../../lib/data/haro";
import { ObjectId } from "mongodb";


const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res){

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    if (req.method !== 'GET'){
        return res.stasus(405).json({error: "Method not allowed"})
    }

    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ")? auth.slice(7): null;

        if (!token) return res.status(401).json({error: "Missing token"});

        
        const page = Number(req.query.page) ;
        const limit = Number(req.query.limit) ;
        const skip = (page -1 ) * limit;
        
        const decoded = jwt.verify(token, JWT_SECRET);

        const profile = await findOne("profiles", {
                expert_email: decoded.email 
        });

        if (!profile) {
            return res.status(200).json({
                success: true,
                pitches: [],
                pagination: {
                   currentPage: page,
                    limit,
                    totalPages: 0
                }
            });
        }

        const expertProfileId = profile._id.toString();
        if (!expertProfileId) {
            return res.status(400).json({ error: "Profile is missing profile_id" });
        }


        const filter = {
            "profile_id": expertProfileId, 
            "pitch_time": {
                $exists: true,
                $nin: [""]
            },
        };

        const total = await countDocuments("matches", filter);
        const totalPages = Math.ceil(total/limit)
        
        const minified_pitches = await findMany(
            "matches", 
            filter,
            {
                sort: { "pitch_time": -1 },
                limit: limit,
                skip: skip
            }
        );

        // Find query details from the query_id in each pitch
        const pitches = await Promise.all(
            minified_pitches.map(async (p) => {
            const toObjectId = (query_id) =>
                typeof query_id === "string" && ObjectId.isValid(query_id)
                    ? new ObjectId(query_id)
                    : query_id;
            const query = await findOne("queries", {
                "_id": toObjectId(p.query_id)
            });
            return { ...p, ...query,...profile };
        })
);

        return res.status(200).json({
            success: true, 
            pitches,
            pagination: {
                currentPage: page,
                limit,
                totalPages
            }
        });

    } catch(e){
        console.log(e)
        return res.status(401).json({error: "Unauthorized"});
    }
}