import Product from "../model/productModel.js"
import Category from "../model/categoryModel.js"
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
import { uploadToCloudinary, deleteFromCloudinary, removeLocalFile } from "../utils/cloudinaryUpload.js"

// helper to normalize availableSizes from array, comma string or JSON string
const parseAvailableSizes = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) {
        return val.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return parsed.map((s) => String(s).trim()).filter(Boolean);
            }
        } catch {
            // fall back to comma-separated
        }
        return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
};

// form-data: name, price, oldprice, category, brand, description, stock, unit, availableSizes, status, productimage (file)
export const createproduct = async (req, res) => {
    try {
        const { name, price, unit, availableSizes } = req.body;
        if (!name || price === undefined || price === "") {
            removeLocalFile(req.file);
            return res.status(400).json({ success: false, message: "Product name and price are required" });
        }

        const data = { ...req.body };
        if (unit !== undefined) {
            data.unit = typeof unit === "string" ? unit.trim() : unit;
        }
        if (availableSizes !== undefined) {
            data.availableSizes = parseAvailableSizes(availableSizes);
        }
        if (req.file) {
            const img = await uploadToCloudinary(req.file.path, "products");
            data.productimage = img.url;
            data.imagePublicId = img.publicId;
        }

        const product = await Product.create(data)
        res.status(201).json({
            success: true,
            message: "product created successfully",
            data: product,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// query: search, category, brand, minPrice, maxPrice, status, page, limit
export const getallproduct = async (req, res) => {
    try {
        const { search, minPrice, maxPrice, category, brand, status, page, limit } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (status) query.status = status;

        let finder = Product.find(query)
            .populate('category', 'name image status')
            .populate('brand', 'name image status')
            .sort({ createdAt: -1 })
            .lean();

        // pagination is optional
        if (page || limit) {
            const p = Math.max(parseInt(page) || 1, 1);
            const l = Math.max(parseInt(limit) || 10, 1);
            finder = finder.skip((p - 1) * l).limit(l);
        }

        const [products, total] = await Promise.all([
            finder,
            Product.countDocuments(query)
        ]);

        // Add Cache-Control header for fast response caching (30s)
        res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            data: products
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getsingleproduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').populate('brand');
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateproduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            removeLocalFile(req.file);
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const data = { ...req.body };
        delete data.imagePublicId;
        if (data.unit !== undefined && typeof data.unit === "string") {
            data.unit = data.unit.trim();
        }
        if (data.availableSizes !== undefined) {
            data.availableSizes = parseAvailableSizes(data.availableSizes);
        }

        if (req.file) {
            const img = await uploadToCloudinary(req.file.path, "products");
            await deleteFromCloudinary(product.imagePublicId);
            data.productimage = img.url;
            data.imagePublicId = img.publicId;
        }

        product.set(data);
        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteproduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await deleteFromCloudinary(product.imagePublicId);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getProductsByCategoryName = async (req, res) => {
    try {
        const { categoryName } = req.params;

        const categoryDoc = await Category.findOne({
            name: { $regex: new RegExp('^' + escapeRegex(categoryName) + '$', 'i') }
        });

        if (!categoryDoc) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const products = await Product.find({ category: categoryDoc._id }).populate('category').populate('brand');

        res.status(200).json({
            success: true,
            category: categoryDoc.name,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
