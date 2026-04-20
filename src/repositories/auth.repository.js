import { User } from "../models/user.model.js"

export const findUserByEmail = (email) => {
    return User.findOne({ email }).select("+password +refreshToken")
}

export const createUser = (data) => {
    return User.create(data)
}

export const updateRefreshToken = (userId, token) => {
    return User.findByIdAndUpdate(
        userId,
        {refreshToken: token},
        { new: true }
    )
}

export const removeRefreshToken = (userId) => {
    return User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: ""}}
    )
}