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
        const { productId, quantity = 1, size = "" } = req.body;
        const qty = Number(quantity);

        if (!productId || !qty || qty < 1) {
            return res.status(400).json({ success: false, message: "Valid productId and quantity are required" });
        }

        const product = await Product.findById(productId);
        if (!product || product.status !== "Active") {
            return res.status(404).json({ success: false, message: "Product not available" });
        }

        const itemSize = typeof size === "string" ? size.trim() : "";

        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            const itemIndex = cart.items.findIndex(
                p => p.productId.toString() === productId && (p.size || "") === itemSize
            );
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += qty;
            } else {
                cart.items.push({ productId, quantity: qty, size: itemSize });
            }
            await cart.save();
        } else {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ productId, quantity: qty, size: itemSize }]
            });
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
        const { productId, itemId, size, quantity } = req.body;

        if (!(Number(quantity) >= 1)) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        let item = null;
        if (itemId) {
            item = cart.items.id(itemId);
        } else if (productId) {
            item = cart.items.find(
                i => i.productId.toString() === productId && (size === undefined || (i.size || "") === (size || ""))
            );
        }

        if (!item) {
            return res.status(404).json({ success: false, message: "Cart Item not found" });
        }

        item.quantity = Number(quantity);
        await cart.save();

        const data = await buildCartResponse(req.user._id);
        res.status(200).json({ success: true, message: "Quantity updated", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const removeFromCart = async (req, res) => {
    try {
        const { productId, itemId, size } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        if (itemId) {
            cart.items = cart.items.filter(i => i._id.toString() !== itemId.toString());
        } else if (productId) {
            cart.items = cart.items.filter(
                i => !(i.productId.toString() === productId && (size === undefined || (i.size || "") === (size || "")))
            );
        }

        await cart.save();
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
