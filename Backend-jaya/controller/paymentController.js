import mongoose from "mongoose";
import Payment from "../model/paymentModel.js";
import Order from "../model/orderModel.js";
import { uploadToCloudinary, deleteFromCloudinary, removeLocalFile } from "../utils/cloudinaryUpload.js";
import { cancelOrderInternal } from "../utils/orderHelper.js";

// 1. QR / barcode details to show on the checkout page
export const getPaymentQR = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            qrImage: process.env.PAYMENT_QR_IMAGE_URL,
            upiId: process.env.PAYMENT_UPI_ID,
            payeeName: process.env.PAYMENT_PAYEE_NAME,
            deliveryCharge: Number(process.env.DELIVERY_CHARGE) || 0,
        }
    });
};

// 2. Customer uploads the "payment successful" screenshot AFTER paying via QR
// form-data: amount, transactionId (optional), screenshot (file)  -> returns paymentId
export const uploadPaymentScreenshot = async (req, res) => {
    try {
        const { amount, transactionId } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Payment screenshot is required" });
        }
        if (!(Number(amount) > 0)) {
            removeLocalFile(req.file);
            return res.status(400).json({ success: false, message: "Valid paid amount is required" });
        }

        const img = await uploadToCloudinary(req.file.path, "payment-screenshots");

        const payment = await Payment.create({
            user: req.user._id,
            amount: Number(amount),
            transactionId,
            screenshot: img.url,
            screenshotPublicId: img.publicId,
        });

        res.status(201).json({
            success: true,
            message: "Screenshot uploaded. You can now place your order.",
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Logged-in user's payments
export const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. Admin: all payments (?status=Pending|Verified|Rejected)
export const getAllPayments = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;

        const payments = await Payment.find(query)
            .populate("user", "name phoneno email")
            .populate("order", "orderId status pricing.total")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 5. Single payment (admin or owner)
export const getSinglePayment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid payment id" });
        }
        const payment = await Payment.findById(id)
            .populate("user", "name phoneno email")
            .populate("order", "orderId status pricing.total");

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        if (req.user.role !== "admin" && String(payment.user._id) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 6. Admin: verify / reject payment (payment status)
// body: { status: "Verified" | "Rejected", remark }
export const updatePaymentStatus = async (req, res) => {
    try {
        const { status, remark } = req.body;

        if (!["Verified", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be Verified or Rejected" });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        payment.status = status;
        payment.remark = remark;
        payment.verifiedBy = req.user._id;
        payment.verifiedAt = new Date();
        await payment.save();

        // keep the linked order in sync
        if (payment.order) {
            const order = await Order.findById(payment.order);
            if (order) {
                if (status === "Verified") {
                    order.payment.status = "Paid";
                    await order.save();
                } else {
                    order.payment.status = "Failed";
                    await order.save();
                    // rejected payment -> cancel the order (stock is restored)
                    await cancelOrderInternal(order, remark || "Payment rejected by admin", req.user._id);
                }
            }
        }

        res.status(200).json({ success: true, message: `Payment ${status.toLowerCase()}`, data: payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 7. Admin: delete payment record (only if not attached to an order)
export const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        if (payment.order) {
            return res.status(400).json({ success: false, message: "Payment is linked to an order and cannot be deleted" });
        }
        await deleteFromCloudinary(payment.screenshotPublicId);
        await payment.deleteOne();
        res.status(200).json({ success: true, message: "Payment deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
