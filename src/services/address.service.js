import {
  countUserAddressesRepo,
  createAddressRepo,
  deleteAddressRepo,
  findAddressByIdRepo,
  findAddressesByUserLeanRepo,
  findUserAddressByIdRepo,
  unsetDefaultAddressesRepo,
  updateAddressRepo,
} from '../repositories/address.repository.js';

import { ApiError } from '../utils/ApiError.js';

// Create Address

export const createAddressService = async (userId, data) => {
  const addressCount = await countUserAddressesRepo(userId);

  const address = await createAddressRepo({
    ...data,
    user: userId,
    isDefault: addressCount === 0,
  });

  return address;
};

// Get Addresses

export const getAddressesService = async (userId) => {
  return await findAddressesByUserLeanRepo(userId);
};

// Get Address by ID

export const getAddressByIdService = async (userId, addressId) => {
  const address = await findUserAddressByIdRepo(userId, addressId);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  return address;
};

// Update Address

export const updateAddressService = async (userId, addressId, data) => {
  const address = await findUserAddressByIdRepo(userId, addressId);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  return await updateAddressRepo(addressId, data);
};

// Delete Address

export const deleteAddressService = async (userId, addressId) => {
  const address = await findUserAddressByIdRepo(userId, addressId);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  const addresses = await findAddressesByUserLeanRepo(userId);

  if (addresses.length === 1) {
    throw new ApiError(400, 'You must have at least one address.');
  }

  await deleteAddressRepo(addressId);

  if (address.isDefault) {
    const remainingAddresses = await findAddressesByUserLeanRepo(userId);

    if (remainingAddresses.length > 0) {
      await updateAddressRepo(remainingAddresses[0]._id, {
        isDefault: true,
      });
    }
  }

  return;
};

// Set Default Address

export const setDefaultAddressService = async (userId, addressId) => {
  const address = await findUserAddressByIdRepo(userId, addressId);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  if (address.isDefault) {
    return address;
  }

  await unsetDefaultAddressesRepo(userId);

  return await updateAddressRepo(addressId, {
    isDefault: true,
  });
};
