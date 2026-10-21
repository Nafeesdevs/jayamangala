import Wishlist from "../model/whislistModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";

// 1. Add or Remove Item from Wishlist (Toggle)
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const existingItem = await Wishlist.findOne({ user: req.user._id, productId });

        if (existingItem) {
            await Wishlist.findByIdAndDelete(existingItem._id);
            return res.status(200).json({
                success: true,
                message: "Removed from wishlist",
                action: "removed"
            });
        }

        const newItem = await Wishlist.create({ user: req.user._id, productId });
        return res.status(201).json({
            success: true,
            message: "Added to wishlist",
            action: "added",
            data: newItem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Wishlist Items of the logged-in user
export const getUserWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ user: req.user._id })
            .populate("productId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: wishlist.length,
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Remove a single item
export const removeFromWishlist = async (req, res) => {
    try {
        const deleted = await Wishlist.findOneAndDelete({ user: req.user._id, productId: req.params.productId });
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Item not found in wishlist" });
        }
        res.status(200).json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Clear Entire Wishlist
export const clearWishlist = async (req, res) => {
    try {
        await Wishlist.deleteMany({ user: req.user._id });
        res.status(200).json({ success: true, message: "Wishlist cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Wishlist -> Cart
// body: { productId }  -> move one item
// body: {}             -> move all items
export const moveToCart = async (req, res) => {
    try {
        const { productId } = req.body || {};

        const filter = { user: req.user._id };
        if (productId) filter.productId = productId;

        const wishItems = await Wishlist.find(filter).populate("productId");
        if (!wishItems.length) {
            return res.status(404).json({ success: false, message: "Nothing to move" });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = new Cart({ user: req.user._id, items: [] });

        let moved = 0;
        for (const w of wishItems) {
            if (!w.productId || w.productId.status !== "Active") continue; // skip deleted / inactive
            const idx = cart.items.findIndex(i => i.productId.toString() === w.productId._id.toString());
            if (idx > -1) cart.items[idx].quantity += 1;
            else cart.items.push({ productId: w.productId._id, quantity: 1 });
            moved++;
        }

        await cart.save();
        await Wishlist.deleteMany({ _id: { $in: wishItems.map(w => w._id) } });

        res.status(200).json({ success: true, message: `${moved} item(s) moved to cart`, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
