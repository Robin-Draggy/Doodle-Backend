import { Address } from '../models/address.model.js';

// Create

export const createAddressRepo = (data) => {
  return Address.create(data);
};

// Find One

export const findAddressByIdRepo = (addressId) => {
  return Address.findById(addressId);
};

export const findAddressByIdLeanRepo = (addressId) => {
  return Address.findById(addressId).lean();
};

export const findDefaultAddressRepo = (userId) => {
  return Address.findOne({
    user: userId,
    isDefault: true,
  });
};

// Find Many

export const findAddressesByUserRepo = (userId) => {
  return Address.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

export const findAddressesByUserLeanRepo = (userId) => {
  return Address.find({ user: userId })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .lean();
};

// Update

export const updateAddressRepo = (addressId, data) => {
  return Address.findByIdAndUpdate(addressId, data, {
    new: true,
    runValidators: true,
  });
};

// Delete

export const deleteAddressRepo = (addressId) => {
  return Address.findByIdAndDelete(addressId);
};

// Utility functions

export const unsetDefaultAddressesRepo = (userId) => {
  return Address.updateMany(
    { user: userId },
    {
      $set: {
        isDefault: false,
      },
    }
  );
};

export const countUserAddressesRepo = (userId) => {
  return Address.countDocuments({
    user: userId,
  });
};

export const findUserAddressByIdRepo = (userId, addressId) => {
  return Address.findOne({
    _id: addressId,
    user: userId,
  });
};
