import {
  createAddressService,
  deleteAddressService,
  getAddressByIdService,
  getAddressesService,
  setDefaultAddressService,
  updateAddressService,
} from '../services/address.service.js';

import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create Address

export const createAddress = AsyncHandler(async (req, res) => {
  const address = await createAddressService(req.user._id, req.body);

  res.status(201).json(new ApiResponse(201, address, 'Address created successfully.'));
});

// Get All Addresses

export const getAddresses = AsyncHandler(async (req, res) => {
  const addresses = await getAddressesService(req.user._id);

  res.status(200).json(new ApiResponse(200, addresses, 'Addresses fetched successfully.'));
});

// Get Address by ID

export const getAddressById = AsyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await getAddressByIdService(req.user._id, addressId);

  res.status(200).json(new ApiResponse(200, address, 'Address fetched successfully.'));
});

// Update Address

export const updateAddress = AsyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await updateAddressService(req.user._id, addressId, req.body);

  res.status(200).json(new ApiResponse(200, address, 'Address updated successfully.'));
});

// Delete Address

export const deleteAddress = AsyncHandler(async (req, res) => {
  const { addressId } = req.params;

  await deleteAddressService(req.user._id, addressId);

  res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully.'));
});

// Set Default Address

export const setDefaultAddress = AsyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await setDefaultAddressService(req.user._id, addressId);

  res.status(200).json(new ApiResponse(200, address, 'Default address updated successfully.'));
});

// Get Default Address

export const getDefaultAddress = AsyncHandler(async (req, res) => {
  const addresses = await getAddressesService(req.user._id);

  const address = addresses.find((address) => address.isDefault);

  res
    .status(200)
    .json(new ApiResponse(200, address || null, 'Default address fetched successfully.'));
});
