import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from '../models/Car.js'
// generate jwt token
const generateToken=(userId)=>{
    const payload=userId
    return jwt.sign(payload,process.env.JWT_SECRET)
}

//register user
export const registerUser=async (req , res)=>{
    try{
        const {name , email , password} = req.body
        if(!name || !email || !password || password.length <8){
            return res.status(400).json({success : false, message:'Fill all the fields'})
        }

        const userExists=await User.findOne({email})
        if(userExists){
            return res.status(400).json({success: false, message: 'User already exists'})
        }
        
        const hashedPassword=await bcrypt.hash(password,10)
        const user=await User.create({name, email, password:hashedPassword})
        const token=generateToken(user._id.toString())
        res.status(201).json({success:true,token})

    } catch(e){
        console.log(e.message)
        res.status(400).json({success:false,message:e.message})
    }
}

//user login
export const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({success:false, message:"user not found"})
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({success:false, message:"Invalid credentials"})
        }
        const token=generateToken(user._id.toString())
        res.status(200).json({success:true,token})

    }catch(e){
        console.log(e.message)
        res.status(400).json({success:false,message:e.message})
    }
}

// get user data usin token
export const getUserData=async(req,res)=>{
    try{
        const {user}=req
        return res.status(200).json({success:true,user})
    }catch(e){
        res.status(400).json({success:false,message:e.message})
    }
}

// get all cars for the frontend
export const getCars=async(req,res)=>{
    try{
        const cars=await Car.find({isAvailable: true})
        res.status(200).json({success:true,cars})
    }catch(e){
        res.status(400).json({success:false,message:e.message})
    }
}
