import mongoose from "mongoose";

/**
 * Enhanced Conversion Event Store.
 * Records conversion touchpoints, drop-offs, and interactions.
 * Automatic TTL index clears raw records after 90 days.
 */
export const ALLOWED_EVENTS = [
  "product_view",       // user viewed product details
  "add_to_cart",        // item added to cart
  "checkout_start",     // user navigated to checkout
  "checkout_dropoff",   // user left checkout without placing order
  "order_placed",       // order successfully created
  "wa_enquiry",         // clicked WhatsApp enquiry (product page)
  "wa_order_confirm",   // clicked WhatsApp confirmation after checkout
  "homepage_enquiry",   // enquiry submitted via homepage
  "contact_submit",     // contact form submitted
  "wholesale_submit",   // wholesale lead form submitted
  "wishlist_add",       // product saved to wishlist
  "cta_click"           // key CTA buttons clicked
];

const analyticsSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: ALLOWED_EVENTS,
      index: true,
    },
    // Optional Contextual Metadata
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    productName: { type: String, default: null, trim: true, maxlength: 200 },
    orderId: { type: String, default: null, trim: true, maxlength: 100 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sessionId: { type: String, default: null, trim: true, maxlength: 100, index: true },
    idempotencyKey: { type: String, default: null, trim: true, maxlength: 128 },
    ipHash: { type: String, default: null, select: false },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function (v) {
          if (!v || typeof v !== "object") return true;
          try {
            return JSON.stringify(v).length <= 4096;
          } catch {
            return false;
          }
        },
        message: "Metadata exceeds maximum allowed size"
      }
    },
    // Passive Metadata
    lang: { type: String, default: "en", trim: true, maxlength: 10 },
    source: { type: String, default: "web", trim: true, maxlength: 50 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false, timestamps: false }
);

// Auto-expire documents after 90 days
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
analyticsSchema.index({ event: 1, createdAt: -1 });
analyticsSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
analyticsSchema.index({ event: 1, sessionId: 1, productId: 1, createdAt: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
