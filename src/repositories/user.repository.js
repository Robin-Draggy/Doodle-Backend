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

export const findUserById = (id) => {
  return User.findById(id).select("-password -refreshToken").lean();
};

export const updateUser = (id, data) => {
  return User.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password -refreshToken");
};

export const addAddress = (userId, address) => {
  return User.findByIdAndUpdate(
    userId,
    { $push: { addresses: address } },
    { new: true }
  ).select("-password -refreshToken");
};

export const removeAddress = (userId, addressId) => {
  return User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { returnDocument: "after" }
  ).select("-password -refreshToken");
};