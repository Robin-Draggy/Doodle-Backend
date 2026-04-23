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
        { returnDocument: "after" }
    )
}

export const removeRefreshToken = (userId) => {
    return User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: ""}}
    )
}

export const findUserById = (id) => {
  return User.findById(id).select("-password -refreshToken");
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
    { returnDocument: "after" }
  ).select("-password -refreshToken");
};

export const updateAddress = (userId, addressId, data) => {
  return User.findOneAndUpdate(
    {_id: userId, "addresses._id": addressId},
    {$set: {
      "addresses.$": {...data, _id: addressId}
    }},
    { returnDocument: "after" }
  ).select("-password -refreshToken")
}

export const removeAddress = (userId, addressId) => {
  return User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { returnDocument: "after" }
  ).select("-password -refreshToken");
};