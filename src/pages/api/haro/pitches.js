import jwt from "jsonwebtoken";
import { findMany, countDocuments } from "../../../lib/data/haro";

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
        const filter = {
            "expert_email": decoded.email, 
            "pitch_time": {
                $exists: true,
                $nin: [""]
            },
        };

        const total = await countDocuments("requests", filter);
        const totalPages = Math.ceil(total/limit)
        
        const pitches = await findMany(
            "requests", 
            filter,
            {
                sort: { "pitch_time": -1 },
                limit: limit,
                skip: skip
            }
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
        return res.status(401).json({error: "Unauthorized"});
    }
}