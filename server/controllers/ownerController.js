import imagekit from '../config/imagekit.js'
import User from '../models/user.js'
import Car from '../models/Car.js'
import Booking from '../models/Booking.js'
import fs from 'fs'
//changeRole of user
export const changeRoleToOwner=async(req , res)=>{
    try{
        
        const {_id}=req.user
        await User.findByIdAndUpdate(_id, {role: "owner"})
        res.json({success: true, message: "Now you can list cars"})
    }catch(e){
        console.log(e.message)
        res.json({success:false, message:e.message})
    }
}

// API to list car
export const addCar=async(req,res)=>{
    try{
        
        const {_id}=req.user
        let car=JSON.parse(req.body.carData)
        const imageFile=req.file

        //upload image to imagekit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response=await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder: '/cars'
        })

        // optimize through imagekit URL transformation
        var optimizedImageUrl=imagekit.url({
            path: response.filePath,
            transformation: [
                {width: '1280'},  // width resize
                {quality: 'auto'}, //auto compression
                {format: 'webp'} // convert to modern format
            ]
        });

        const image=optimizedImageUrl
        await Car.create({...car, owner: _id, image})
        res.json({success: true, message: "Car Added"})

    }catch(e){
        console.log(e.message)
        res.json({success:false, message:e.message})
    }
}

// api to list an owner all cars
export const getOwnerCars = async (req,res)=>{
    try{
        const {_id}=req.user
        const cars=await Car.find({owner: _id})
        res.status(200).json({success:true,cars})
    }catch(e){
        console.log(e)
        res.status(400).json({success: false, message: e.message})
    }
}

// API to toggle car Availability
export const toggleCarAvailability=async (req,res)=>{
    try{
        const {_id}=req.user
        const {carId}=req.body
        const car=await Car.findById(carId)

        //checking is car belongs to the user
        if(car.owner.toString() != _id.toString()){
            return res.json({success: false, message:"Unauthorized"});
        }
        car.isAvailable= !car.isAvailable
        await car.save()
        return res.json({success: true, message: "Car Availability toggled"})

    }catch(e){
        return res.json({success: false, message: "Unauthorized"})
    }
}

// API for any owner can delete their car
export const deleteCar=async (req,res)=>{
    try{
        const {_id}=req.user
        const {carId}=req.body
        const car=await Car.findById(carId)

        //checking is car belongs to the user
        if(car.owner.toString() != _id.toString()){
            return res.json({success: false, message:"Unauthorized"});
        }
        car.owner=null
        car.isAvailable= false
        await car.save()
        return res.json({success: true, message: "Car Removed"})

    }catch(e){
        console.log(e.message)
        return res.json({success: false, message: e.message})
    }
}

//API to get Dashboard data
export const getDashboardData=async(req,res)=>{
    try{
        const {_id, role}=req.user;
        if(role !== 'owner'){
            return res.json({success:false, message: "Unauthorized"})
        }
        const cars=await Car.find({owner: _id})
    
        const bookings=await Booking.find({owner :_id}).populate('car').sort({createdAt:-1})

        const pendingBookings=await Booking.find({owner:_id , status: "pending" })
        const completedBookings = await Booking.find({owner : _id, status: "confirmed"})

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking)=> acc + booking.price,0)

        const dashboardData={
            totalCars : cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({success:true, dashboardData})

    }catch(e){
        console.log(e.message)
        return res.json({success: false, message: e.message})
    }
}

// API to update user image
export const updateUserImage= async (req , res)=>{
    try{
        const {_id}=req.user
        const imageFile=req.file

        //upload image to imagekit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response=await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder: '/users'
        })

        // optimize through imagekit URL transformation
        var optimizedImageUrl=imagekit.url({
            path: response.filePath,
            transformation: [
                {width: '400'},  // width resize
                {quality: 'auto'}, //auto compression
                {format: 'webp'} // convert to modern format
            ]
        });

        const image=optimizedImageUrl
        await User.findByIdAndUpdate(_id, {image})
        return res.json({success:true, message: "image updated"})
       

    }catch(e){
        console.log(e.message)
        return res.json({success:false, message:e.message})
    }
}


