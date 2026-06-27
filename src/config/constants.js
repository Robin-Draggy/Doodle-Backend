export const DB_NAME = "doodle"

export const PRODUCT_STATUS = ["draft", "published", "archived"];

export const MAX_IMAGE_UPLOAD = 5;

export const CATEGORY_STATUS = ["active", "inactive"];

export const PARSE_JSON_FIELD = (field) => {
  if (field === undefined || field === null || field === "") {
    return undefined;
  }

  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      throw new ApiError(400, "Invalid JSON format.");
    }
  }

  return field;
};