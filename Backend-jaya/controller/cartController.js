import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";

// helper: cart with populated products + totals
const buildCartResponse = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate("items.productId");
    if (!cart) {
        return { user: userId, items: [], totalItems: 0, totalAmount: 0 };
    }
    let totalItems = 0;
    let totalAmount = 0;
    cart.items.forEach(i => {
        if (i.productId) {
            totalItems += i.quantity;
            totalAmount += i.productId.price * i.quantity;
        }
    });
    return { ...cart.toObject(), totalItems, totalAmount };
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const qty = Number(quantity);

        if (!productId || !qty || qty < 1) {
            return res.status(400).json({ success: false, message: "Valid productId and quantity are required" });
        }

        const product = await Product.findById(productId);
        if (!product || product.status !== "Active") {
            return res.status(404).json({ success: false, message: "Product not available" });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += qty;
            } else {
                cart.items.push({ productId, quantity: qty });
            }
            await cart.save();
        } else {
            cart = await Cart.create({ user: req.user._id, items: [{ productId, quantity: qty }] });
        }

        const data = await buildCartResponse(req.user._id);
        res.status(200).json({ success: true, message: "Added to cart", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getCart = async (req, res) => {
    try {
        const data = await buildCartResponse(req.user._id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!(Number(quantity) >= 1)) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id, "items.productId": productId },
            { $set: { "items.$.quantity": Number(quantity) } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart or Item not found" });
        }

        const data = await buildCartResponse(req.user._id);
        res.status(200).json({ success: true, message: "Quantity updated", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { items: { productId } } },
            { new: true }
        );

        const data = await buildCartResponse(req.user._id);
        res.status(200).json({ success: true, message: "Item removed", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
