export class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = [
      "page",
      "limit",
      "sort",
      "fields",
      "q",
      "minPrice",
      "maxPrice",
    ];

    excludedFields.forEach((field) => delete queryObj[field]);

    // MongoDB operators
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|nin)\b/g,
      (match) => `$${match}`
    );

    const filters = JSON.parse(queryStr);

    // Price range
    if (
      this.queryString.minPrice !== undefined ||
      this.queryString.maxPrice !== undefined
    ) {
      filters.price = {};

      if (this.queryString.minPrice !== undefined) {
        filters.price.$gte = Number(this.queryString.minPrice);
      }

      if (this.queryString.maxPrice !== undefined) {
        filters.price.$lte = Number(this.queryString.maxPrice);
      }
    }

    // Tags
    if (this.queryString.tags) {
      filters.tags = {
        $in: this.queryString.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase()),
      };
    }

    // Boolean
    if (this.queryString.isFeatured !== undefined) {
      filters.isFeatured =
        this.queryString.isFeatured === "true";
    }

    this.query = this.query.find(filters);

    return this;
  }

  search() {
    if (this.queryString.q) {
      this.query = this.query.find({
        $text: {
          $search: this.queryString.q,
        },
      });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(",")
        .join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  select() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(",")
        .join(" ");

      this.query = this.query.select(fields);
    }

    return this;
  }

  paginate() {
    const page = Math.max(
      Number(this.queryString.page) || 1,
      1
    );

    const limit = Math.min(
      Number(this.queryString.limit) || 10,
      50
    );

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}