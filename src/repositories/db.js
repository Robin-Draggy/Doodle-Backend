import mongoose from "mongoose";
import { DB_NAME } from "../config/constants.js";


export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)        
    } catch (error) {
        console.log("Mongodb connection failed", error)
        process.exit(1)
    }
}