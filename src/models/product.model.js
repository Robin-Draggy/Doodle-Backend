import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: "text"
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    stock: {
        type: Number,
        default: 0
    },
    images: [String],
    ratings: {
        average: {type: Number, default: 0},
        count: {type: Number, default: 0}
    }
},{timestamps: true});

productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, price: 1});

export const Product = mongoose.model("Product", productSchema)