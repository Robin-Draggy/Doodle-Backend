import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from '../utils/Cloudinary.js'

export const registerUserService = async (data, file) => {
    const { username, email, password } = data;

    if(!username || !email || !password ){
        throw new ApiError(400, "All fields required")
    }

    // checking if user already exists or not
    const existingUser = await User.findOne({ email });

    if(existingUser){
        throw new ApiError(409, "User already exists with this email")
    }

    let avatarUrl = '';

    if(file?.path){
        const uploaded = await uploadOnCloudinary(file.path);
        avatarUrl = uploaded?.secure_url;
    }

    const user = await User.create({
        username,
        email,
        password,
        avatar : avatarUrl
    })

    // removing sensitive fields manually
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return createdUser;
}