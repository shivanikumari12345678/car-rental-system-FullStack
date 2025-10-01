import jwt from 'jsonwebtoken'
import User from '../models/user.js'
export const protect =async (req , res , next)=>{
    const token=req.headers.authorization
    if(!token){
        return res.status(400).json({success:false, message: "not authorized"})
    }
    try{
        const userId=jwt.verify(token, process.env.JWT_SECRET)
        if(!userId){
            console.log("not valid token")
            return res.status(400).json({success:false, message:"not authorized"})
        }
        req.user=await User.findById(userId).select("-password")
        next()
    } catch (e) {
        if(e.name === 'CastError'){
            res.status(400).json({ error:e.message })
        }else if(e.name === 'ValidationError'){
            res.status(400).json({ error:e.message })
        }else if(e.name ==='MongoServerError' && e.message.includes('E11000 duplicate key error')){
            return res.status(400).json({'error':'expected `username` to be unique.'})
        }else if(e.name === 'JsonWebTokenError'){
            return res.status(401).json({error:'token invalid'})
        }
    }
}