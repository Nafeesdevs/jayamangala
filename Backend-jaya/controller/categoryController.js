import Category from "../model/categoryModel.js"
import { uploadToCloudinary, deleteFromCloudinary, removeLocalFile } from "../utils/cloudinaryUpload.js"

// form-data: name, status, image (file)
export const createcategory = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            removeLocalFile(req.file);
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const data = { name, status };
        if (req.file) {
            const img = await uploadToCloudinary(req.file.path, "categories");
            data.image = img.url;
            data.imagePublicId = img.publicId;
        }

        const category = await Category.create(data)
        res.status(201).json({
            success: true,
            message: "category created successfully",
            data: category,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error creating category",
            error: err.message,
        })
    }
}


export const getallcategory = async (req, res) => {
    try {
        const category = await Category.find().sort({ createdAt: -1 })
        res.status(200).json({
            success: true,
            message: "Sucessfully fetched",
            data: category,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching category",
            error: err.message,
        })
    }
}

export const getsinglecategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: category })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// UPDATE CATEGORY (new image replaces the old one)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            removeLocalFile(req.file);
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const { name, status } = req.body;
        if (name !== undefined) category.name = name;
        if (status !== undefined) category.status = status;

        if (req.file) {
            const img = await uploadToCloudinary(req.file.path, "categories");
            await deleteFromCloudinary(category.imagePublicId);
            category.image = img.url;
            category.imagePublicId = img.publicId;
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: err.message,
        });
    }
}

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await deleteFromCloudinary(deletedCategory.imagePublicId);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: err.message,
        });
    }
}
