import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    oldprice: { type: Number, default: 0 },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        index: true
    },
    description: String,
    status: {
        type: String,
        default: "Active",
        index: true
    },
    stock: {
        type: Number,
        default: 100,
        min: [0, "Stock cannot be negative"]
    },
    unit: {
        type: String,
        trim: true,
        default: ""
    },
    availableSizes: {
        type: [String],
        default: []
    },
    productimage: String,
    imagePublicId: String, // cloudinary public id
}, { timestamps: true })

productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, price: 1 });

const Product = mongoose.model("Product", productSchema)
export default Product;
