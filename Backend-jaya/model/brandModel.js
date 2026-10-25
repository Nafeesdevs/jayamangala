import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: String,
  image: String,
  imagePublicId: String, // cloudinary public id
  status: {
    type: String,
    default: "Active",
    index: true,
  },
}, { timestamps: true })

const Brand = mongoose.model("Brand", brandSchema)
export default Brand
