import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";


export const verify = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if(!token){
        throw new ApiError(401, "Unauthorized")
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid token")
    }
}