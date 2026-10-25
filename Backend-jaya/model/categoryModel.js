import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: String,
  imagePublicId: String, // cloudinary public id (used for delete / replace)
  status: {
    type: String,
    default: "Active",
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Category = mongoose.model("Category", categorySchema)
export default Category
