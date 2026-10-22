import mongoose from "mongoose";
import Order from "../model/orderModel.js";
import Cart from "../model/cartModel.js";
import Payment from "../model/paymentModel.js";
import { reduceStock, restoreStock, cancelOrderInternal } from "../utils/orderHelper.js";

const STATUS_FLOW = ["Ordered", "Processing", "Shipped", "Out for Delivery", "Delivered"];

// ---------------------------------------------------------------
// CREATE ORDER  (cart -> order)
// UPI: customer must first pay via QR and upload the screenshot (/payment/upload). COD: send paymentMethod: "COD".
// body: { paymentMethod?, paymentId, name?, phone?, address, pincode, deliveryDate? }
// ---------------------------------------------------------------
export const createorder = async (req, res) => {
    try {
        const { paymentId, paymentMethod, name, phone, address, pincode, deliveryDate } = req.body;
        const isCOD = String(paymentMethod || "").toUpperCase() === "COD";

        if (!address || !pincode) {
            return res.status(400).json({ success: false, message: "Address and pincode are required" });
        }

        // 1. UPI/QR orders need the payment screenshot first. COD orders skip this.
        let payment = null;
        if (!isCOD) {
            if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Please pay using the QR code and upload the payment screenshot before placing the order"
                });
            }
            payment = await Payment.findById(paymentId);
            if (!payment || String(payment.user) !== String(req.user._id)) {
                return res.status(404).json({ success: false, message: "Payment not found" });
            }
            if (!payment.screenshot) {
                return res.status(400).json({ success: false, message: "Payment screenshot is missing" });
            }
            if (payment.order) {
                return res.status(400).json({ success: false, message: "This payment is already used for another order" });
            }
            if (payment.status === "Rejected") {
                return res.status(400).json({ success: false, message: "This payment was rejected. Please upload a new screenshot" });
            }
        }

        // 2. items come from the user's cart (prices are always taken from the DB)
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.productId");
        const validItems = cart ? cart.items.filter(i => i.productId && i.productId.status === "Active") : [];
        if (!validItems.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        const items = validItems.map(i => ({
            product: i.productId._id,
            name: i.productId.name,
            size: i.size || "",
            unit: i.productId.unit || "",
            price: i.productId.price,
            quantity: i.quantity,
            image: i.productId.productimage,
        }));

        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const deliveryCharge = Number(process.env.DELIVERY_CHARGE) || 0;
        const total = subtotal + deliveryCharge;

        // 3. paid amount must match the order total (UPI only)
        if (payment && Math.round(payment.amount * 100) !== Math.round(total * 100)) {
            return res.status(400).json({
                success: false,
                message: `Paid amount (₹${payment.amount}) does not match order total (₹${total})`
            });
        }

        // 4. reduce stock
        const stock = await reduceStock(items);
        if (!stock.ok) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${stock.name}` });
        }

        // 5. create order
        let order;
        try {
            order = await Order.create({
                user: req.user._id,
                customerDetails: {
                    name: name || req.user.name,
                    phone: phone || req.user.phoneno,
                    address,
                    pincode,
                },
                items,
                pricing: { subtotal, deliveryCharge, total },
                payment: isCOD
                    ? { method: "COD", status: "Pending" }
                    : {
                        method: "QR",
                        status: payment.status === "Verified" ? "Paid" : "Pending",
                        paymentId: payment._id,
                        screenshot: payment.screenshot,
                    },
                deliveryDate: deliveryDate || null,
                statusHistory: [{ status: "Ordered", note: "Order placed", updatedBy: req.user._id }],
            });
        } catch (err) {
            await restoreStock(items);
            throw err;
        }

        // 6. link payment, clear cart
        if (payment) {
            payment.order = order._id;
            await payment.save();
        }
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------
// READ
// ---------------------------------------------------------------

// Admin: all orders (?status=&paymentStatus=&search=)  - includes payment screenshot
export const getallorder = async (req, res) => {
    try {
        const { status, paymentStatus, search } = req.query;
        const query = {};
        if (status) query.status = status;
        if (paymentStatus) query["payment.status"] = paymentStatus;
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: "i" } },
                { "customerDetails.phone": { $regex: search, $options: "i" } },
                { "customerDetails.name": { $regex: search, $options: "i" } },
            ];
        }

        const orders = await Order.find(query)
            .populate("user", "name phoneno email")
            .populate("payment.paymentId", "status transactionId amount remark")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Single order (owner or admin) - by mongo _id or orderId like ORD-ABC123
export const getsingleorder = async (req, res) => {
    try {
        const order = await findOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (!canAccess(req.user, order)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        await order.populate("payment.paymentId", "status transactionId amount remark");
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Orders of the logged-in user
export const getmyorders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Orders of a single user (admin, or the user himself)
export const getuserorders = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }
        if (req.user.role !== "admin" && String(req.user._id) !== userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Track order -> current status + full history + progress steps
export const trackOrder = async (req, res) => {
    try {
        const order = await findOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (!canAccess(req.user, order)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const currentIndex = STATUS_FLOW.indexOf(order.status);
        const steps = STATUS_FLOW.map((s, idx) => ({
            status: s,
            completed: order.status !== "Cancelled" && idx <= currentIndex,
        }));

        res.status(200).json({
            success: true,
            data: {
                orderId: order.orderId,
                status: order.status,
                paymentStatus: order.payment.status,
                deliveryDate: order.deliveryDate,
                cancelReason: order.cancelReason,
                steps,
                history: order.statusHistory,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin dashboard: number of orders per status
export const getOrderStatusStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
        const data = {};
        stats.forEach(s => { data[s._id] = s.count; });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------

// Admin: update order status  body: { status, note }
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const validStatuses = [...STATUS_FLOW, "Cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(", ")}` });
        }

        const order = await findOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (["Delivered", "Cancelled"].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
        }

        if (status === "Cancelled") {
            await cancelOrderInternal(order, note || "Cancelled by admin", req.user._id);
            return res.status(200).json({ success: true, message: "Order cancelled", data: order });
        }

        // UPI orders: admin can move forward only after the payment screenshot is verified (COD is exempt)
        if (status !== "Ordered" && order.payment.method !== "COD" && order.payment.status !== "Paid") {
            return res.status(400).json({
                success: false,
                message: "Verify the payment first (payment status must be Paid)"
            });
        }

        order.status = status;
        if (status === "Delivered" && order.payment.method === "COD") order.payment.status = "Paid"; // cash collected
        order.statusHistory.push({ status, note, updatedBy: req.user._id });
        await order.save();

        res.status(200).json({ success: true, message: "Order status updated", data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: edit delivery details  body: { name, phone, address, pincode, deliveryDate }
export const updateOrder = async (req, res) => {
    try {
        const order = await findOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const { name, phone, address, pincode, deliveryDate } = req.body;
        if (name !== undefined) order.customerDetails.name = name;
        if (phone !== undefined) order.customerDetails.phone = phone;
        if (address !== undefined) order.customerDetails.address = address;
        if (pincode !== undefined) order.customerDetails.pincode = pincode;
        if (deliveryDate !== undefined) order.deliveryDate = deliveryDate;

        await order.save();
        res.status(200).json({ success: true, message: "Order updated successfully", data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Customer: cancel own order (only before it is shipped)
export const cancelOrder = async (req, res) => {
    try {
        const order = await findOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (!canAccess(req.user, order)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        if (!["Ordered", "Processing"].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Order cannot be cancelled once it is ${order.status}` });
        }

        await cancelOrderInternal(order, req.body?.reason || "Cancelled by customer", req.user._id);
        res.status(200).json({ success: true, message: "Order cancelled", data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------
// DELETE (admin)
// ---------------------------------------------------------------
export const deleteOrder = async (req, res) => {
    try {
        const order = await findOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        // give the stock back if the order was still active
        if (order.status !== "Cancelled") {
            await restoreStock(order.items);
        }
        // free the payment record
        if (order.payment.paymentId) await Payment.findByIdAndUpdate(order.payment.paymentId, { order: null });
        await order.deleteOne();

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------
async function findOrder(idOrOrderId) {
    if (mongoose.isValidObjectId(idOrOrderId)) {
        const byId = await Order.findById(idOrOrderId);
        if (byId) return byId;
    }
    return Order.findOne({ orderId: idOrOrderId });
}

function canAccess(user, order) {
    return user.role === "admin" || String(order.user) === String(user._id);
}
