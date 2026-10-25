import Brand from "../model/brandModel.js"
import { uploadToCloudinary, deleteFromCloudinary, removeLocalFile } from "../utils/cloudinaryUpload.js"

// form-data: name, description, status, image (file - logo)
export const createbrand = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name) {
            removeLocalFile(req.file);
            return res.status(400).json({ success: false, message: "Brand name is required" });
        }

        const data = { name, description, status };
        if (req.file) {
            const img = await uploadToCloudinary(req.file.path, "brands");
            data.image = img.url;
            data.imagePublicId = img.publicId;
        }

        const brand = await Brand.create(data);
        res.status(201).json({ success: true, message: "Brand created successfully", data: brand });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Brand already exists" });
        }
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getallbrand = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ createdAt: -1 }).lean();
        res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getsinglebrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }
        res.status(200).json({ success: true, data: brand });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export const updatebrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            removeLocalFile(req.file);
            return res.status(404).json({ success: false, message: "Brand not found" });
        }

        const { name, description, status } = req.body;
        if (name !== undefined) brand.name = name;
        if (description !== undefined) brand.description = description;
        if (status !== undefined) brand.status = status;

        if (req.file) {
            const img = await uploadToCloudinary(req.file.path, "brands");
            await deleteFromCloudinary(brand.imagePublicId);
            brand.image = img.url;
            brand.imagePublicId = img.publicId;
        }

        await brand.save();
        res.status(200).json({ success: true, message: "Brand updated successfully", data: brand });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Brand already exists" });
        }
        res.status(500).json({ success: false, message: err.message });
    }
}

export const deletebrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }
        await deleteFromCloudinary(brand.imagePublicId);
        res.status(200).json({ success: true, message: "Brand deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
