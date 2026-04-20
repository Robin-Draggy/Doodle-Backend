import { User } from "../models/user.model.js"
import { findUserByEmail, removeRefreshToken, updateRefreshToken, } from "../repositories/auth.repository.js";
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from '../utils/Cloudinary.js'

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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


export const loginUserService = async (email, password) => {
    const user = await findUserByEmail(email);

    if(!user){
        throw new ApiError(401, "User not found")
    }

    const isMatch = await user.isPasswordCorrect(password);

    if(!isMatch){
        throw new ApiError(401, "Invalid credential")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    await updateRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken}
}


export const logoutUserService = async (userId) => {
    await removeRefreshToken(userId)
}