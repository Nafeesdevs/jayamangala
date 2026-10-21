import mongoose from "mongoose";

// One record per "I paid via QR and here is my screenshot"
const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: [1, "Amount must be greater than 0"]
    },
    method: {
        type: String,
        default: "QR"
    },
    transactionId: String, // optional UTR / reference number typed by the customer
    screenshot: { type: String, required: true }, // cloudinary url
    screenshotPublicId: String,
    status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending"
    },
    remark: String, // admin note (reason for rejection etc.)
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
    order: { // filled once the payment is used to create an order
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
