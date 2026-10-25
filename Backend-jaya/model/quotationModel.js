import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        default: "Litre"
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const quotationSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true,
        index: true
    },
    quotationNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [quotationItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true,
        min: 0
    },
    validUntil: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days default
    },
    paymentTerms: {
        type: String,
        default: "50% advance upon order confirmation, balance before dispatch."
    },
    deliveryTerms: {
        type: String,
        default: "Dispatched within 3-5 business days."
    },
    notes: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
        default: "Draft"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true });

quotationSchema.index({ leadId: 1, createdAt: -1 });

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;

