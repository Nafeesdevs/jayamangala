import mongoose from "mongoose";

// Lead Schema for CRM & Sales Funnel
// Statuses support full sales lifecycle:
// "New" -> "Contacted" -> "Qualified" -> "Quote Sent" -> "Won" -> "Lost"
// (Also backwards-compatible with legacy "Quoted", "Converted", "Closed")
const leadSchema = new mongoose.Schema({
    // Contact info
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true,
        default: ""
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: ""
    },

    // What they are interested in (from ENQUIRY_TYPES list)
    productInterest: {
        type: [String],
        default: []
    },

    // Rough estimate of how much they want per month/order
    estimatedQuantity: {
        type: String,
        default: ""
    },

    // Free-form message
    message: {
        type: String,
        default: ""
    },

    // How they found us (wholesale_page | homepage_enquiry | contact_form | whatsapp)
    source: {
        type: String,
        default: "wholesale_page"
    },

    // CRM status — admin updates this as the lead progresses
    status: {
        type: String,
        enum: ["New", "Contacted", "Qualified", "Quote Sent", "Won", "Lost", "Quoted", "Converted", "Closed"],
        default: "New"
    },

    // Follow-up scheduling
    nextFollowUpDate: {
        type: Date,
        default: null
    },
    followUpTime: {
        type: String,
        default: ""
    },
    followUpPriority: {
        type: String,
        enum: ["Low", "Medium", "High", ""],
        default: "Medium"
    },
    followUpNotes: {
        type: String,
        default: ""
    },
    isFollowUpCompleted: {
        type: Boolean,
        default: false
    },

    // Activity timeline / audit trail
    timeline: [{
        action: { type: String, required: true },
        details: { type: String, default: "" },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        performedByName: { type: String, default: "Admin" },
        createdAt: { type: Date, default: Date.now }
    }],

    // Admin notes added during follow-up
    notes: [{
        text: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now }
    }],

    // Which admin is following up (optional assignment)
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, { timestamps: true });

// Index for fast admin queries & follow-up tracking
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ nextFollowUpDate: 1, isFollowUpCompleted: 1 });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
