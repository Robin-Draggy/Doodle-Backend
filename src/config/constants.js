export const DB_NAME = 'doodle';

export const PRODUCT_STATUS = ['draft', 'published', 'archived'];

export const MAX_IMAGE_UPLOAD = 5;

export const CATEGORY_STATUS = ['active', 'inactive'];

export const REVIEW_STATUS = ['published', 'hidden'];

export const ORDER_STATUS_FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export const PAYMENT_STATUS_FLOW = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: [],
  refunded: [],
};

export const PAYMENT_GATEWAYS = [
  "cash_on_delivery",
  "stripe",
  "sslcommerz",
  "bkash",
  "nagad",
];

export const PAYMENT_STATUS = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];

export const PAYMENT_CURRENCY = "BDT";

export const PARSE_JSON_FIELD = (field) => {
  if (field === undefined || field === null || field === '') {
    return undefined;
  }

  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      throw new ApiError(400, 'Invalid JSON format.');
    }
  }

  return field;
};
