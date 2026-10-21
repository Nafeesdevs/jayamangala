import Product from "../model/productModel.js"
import Category from "../model/categoryModel.js"
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
import { uploadToCloudinary, deleteFromCloudinary, removeLocalFile } from "../utils/cloudinaryUpload.js"

// form-data: name, price, oldprice, category, brand, description, stock, status, productimage (file)
export const createproduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price === undefined || price === "") {
            removeLocalFile(req.file);
            return res.status(400).json({ success: false, message: "Product name and price are required" });
        }

        const data = { ...req.body };
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

        let finder = Product.find(query).populate('category').populate('brand').sort({ createdAt: -1 });

        // pagination is optional
        if (page || limit) {
            const p = Math.max(parseInt(page) || 1, 1);
            const l = Math.max(parseInt(limit) || 10, 1);
            finder = finder.skip((p - 1) * l).limit(l);
        }

        const products = await finder;
        const total = await Product.countDocuments(query);

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
