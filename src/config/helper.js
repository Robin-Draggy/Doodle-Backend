import { createCartRepo, findCartDocumentByUserRepo } from '../repositories/cart.repository.js';
import { findCouponByCodeRepo } from '../repositories/coupon.repository.js';
import crypto from 'crypto';

// Get or Create Cart

export const getOrCreateCart = async (userId) => {
  let cart = await findCartDocumentByUserRepo(userId);

  if (!cart) {
    cart = await createCartRepo({
      user: userId,
      items: [],
    });

    cart = await findCartDocumentByUserRepo(userId);
  }

  return cart;
};

// Calculate Cart Totals

export const calculateCartTotals = (cart) => {
  let totalItems = 0;
  let subtotal = 0;
  let totalDiscount = 0;

  cart.items.forEach((item) => {
    item.subtotal = item.finalPrice * item.quantity;

    totalItems += item.quantity;

    subtotal += item.priceAtAddition * item.quantity;

    totalDiscount += (item.priceAtAddition - item.finalPrice) * item.quantity;
  });

  cart.totalItems = totalItems;
  cart.subtotal = subtotal;
  cart.totalDiscount = totalDiscount;
  cart.grandTotal = subtotal - totalDiscount;
};


// Generate Unique Coupon Code

export const generateCouponCode = (prefix = 'SAVE', length = 6) => {
  const random = crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();

  return `${prefix}-${random}`;
};

export const generateUniqueCouponCode = async () => {
  let code;
  let exists;

  do {
    code = generateCouponCode();
    exists = await findCouponByCodeRepo(code);
  } while (exists);

  return code;
};


// Generate Unique Order Number

export const generateOrderNumber = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `ORD-${year}${month}${day}-${random}`;
};

// Build Order Items Snapshot

export const buildOrderItems = (cart) => {
  return cart.items.map((item) => ({
    product: item.product._id,

    name: item.product.name,

    slug: item.product.slug,

    image: item.product.images?.[0] ?? null,

    quantity: item.quantity,

    unitPrice: item.priceAtAddition,

    discountPrice: item.discountPriceAtAddition,

    finalPrice: item.finalPrice,

    subtotal: item.subtotal,
  }));
};

// Build Shipping Address Snapshot

export const buildShippingAddress = (address) => {
  return {
    fullName: address.fullName,

    phone: address.phone,

    addressLine: address.addressLine,

    city: address.city,

    postalCode: address.postalCode,

    country: address.country,
  };
};