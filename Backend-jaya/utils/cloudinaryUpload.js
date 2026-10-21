import fs from "fs";
import cloudinary from "../cloudinary.js";

// Upload a local temp file to cloudinary, then remove the temp file
export const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: "image",
        });
        return { url: result.secure_url, publicId: result.public_id };
    } finally {
        fs.unlink(filePath, () => {});
    }
};

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.log("Cloudinary delete failed:", err.message);
    }
};

// remove temp file when a request fails before upload
export const removeLocalFile = (file) => {
    if (file?.path) fs.unlink(file.path, () => {});
};
