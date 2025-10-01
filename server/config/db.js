import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        mongoose.connection.on('connected', ()=>console.log("database connected"))
        await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`)
    }catch(e){
        console.log(e.message);
    }
}

export default connectDB