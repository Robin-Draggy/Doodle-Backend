import { createCartRepo, findCartDocumentByUserRepo } from '../repositories/cart.repository';

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
