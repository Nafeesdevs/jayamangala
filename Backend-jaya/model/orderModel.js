import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  // Customer details at the time of ordering
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  // Product snapshot at the time of purchase
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String }
  }],

  pricing: {
    subtotal: Number,
    deliveryCharge: { type: Number, default: 0 },
    total: Number
  },

  payment: {
    method: { type: String, default: "QR" },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Paid', 'Failed']
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    screenshot: String, // copy of the cloudinary url so admin sees it right in the order
  },

  deliveryDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["Ordered", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Ordered",
  },
  // Used for "track order"
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now }
  }],
  cancelReason: String,
}, { timestamps: true });

orderSchema.pre('validate', async function () {
  if (!this.orderId) {
    const uniqueString = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderId = `ORD-${uniqueString}`;
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
