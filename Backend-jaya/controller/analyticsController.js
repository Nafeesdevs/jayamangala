import crypto from "crypto";
import mongoose from "mongoose";
import Analytics, { ALLOWED_EVENTS } from "../model/analyticsModel.js";
import Order from "../model/orderModel.js";

/**
 * Helper to compute an anonymous client IP hash to protect against spam / duplication
 */
function getIpHash(req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "";
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip + (process.env.JWT_SECRET || "jaya_salt")).digest("hex").slice(0, 32);
}

/**
 * POST /event (public — rate limited, validated, deduplicated)
 */
export const trackEvent = async (req, res) => {
  // Always respond immediately to avoid blocking client execution
  res.status(200).json({ success: true });

  try {
    const body = req.body;
    if (!body || typeof body !== "object") return;

    const { event, productId, productName, orderId, userId, metadata, lang, source, sessionId, idempotencyKey } = body;

    // 1. Strict Event Validation
    if (!event || typeof event !== "string" || !ALLOWED_EVENTS.includes(event)) {
      return;
    }

    // 2. Format / Sanitize fields
    const safeLang = typeof lang === "string" ? lang.slice(0, 10) : "en";
    const safeSource = typeof source === "string" ? source.slice(0, 50) : "web";
    const safeSessionId = typeof sessionId === "string" ? sessionId.trim().slice(0, 100) : null;
    const safeProductName = typeof productName === "string" ? productName.trim().slice(0, 200) : null;
    const safeOrderId = typeof orderId === "string" ? orderId.trim().slice(0, 100) : null;
    const safeMetadata = metadata && typeof metadata === "object" ? metadata : {};

    // Validate ObjectIds if provided
    const validProductId = productId && mongoose.isValidObjectId(productId) ? productId : null;
    const validUserId = userId && mongoose.isValidObjectId(userId) ? userId : null;

    // 3. Duplicate Prevention & Idempotency
    const ipHash = getIpHash(req);

    // Compute or validate idempotency key
    let finalIdempotencyKey = null;
    if (typeof idempotencyKey === "string" && idempotencyKey.trim().length > 0) {
      finalIdempotencyKey = idempotencyKey.trim().slice(0, 128);
    }

    // Server-side deduplication window:
    // If a user/session sends the exact same event on the same product/order within 5 seconds, drop it
    const dedupeWindow = new Date(Date.now() - 5000);
    const duplicateQuery = {
      event,
      createdAt: { $gte: dedupeWindow },
    };

    if (safeSessionId) {
      duplicateQuery.sessionId = safeSessionId;
    } else if (ipHash) {
      duplicateQuery.ipHash = ipHash;
    }

    if (validProductId) duplicateQuery.productId = validProductId;
    if (safeOrderId) duplicateQuery.orderId = safeOrderId;

    // If we have an identifier (session or ipHash), check for duplicate within the 5s window
    if (safeSessionId || ipHash) {
      const exists = await Analytics.findOne(duplicateQuery).select("_id").lean();
      if (exists) {
        return; // Suppress duplicate burst
      }
    }

    await Analytics.create({
      event,
      productId: validProductId,
      productName: safeProductName,
      orderId: safeOrderId,
      userId: validUserId,
      sessionId: safeSessionId,
      idempotencyKey: finalIdempotencyKey,
      ipHash,
      metadata: safeMetadata,
      lang: safeLang,
      source: safeSource,
    });
  } catch (err) {
    // If duplicate key error on idempotencyKey (E11000), ignore gracefully
    if (err.code === 11000) return;
    // Silently handle analytics insertion errors without crashing
  }
};

/**
 * GET /analytics/summary (admin only)
 * Aggregates server-verified order metrics alongside behavioral conversion funnel.
 */
export const getSummary = async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailySince = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // 1. Fetch Event Totals & Distinct Sessions concurrently
    const [
      totals,
      topProducts,
      dropoffCount,
      distinctProductViewSessions,
      distinctCartAddSessions,
      distinctCheckoutSessions,
      // 2. Fetch Server-Verified Order Metrics directly from the Order collection
      verifiedOrdersAgg,
      verifiedDailyOrders
    ] = await Promise.all([
      // Total counts by event type
      Analytics.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Top 5 viewed products
      Analytics.aggregate([
        { $match: { event: "product_view", productId: { $ne: null }, createdAt: { $gte: since } } },
        { $group: { _id: "$productId", name: { $first: "$productName" }, views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
      ]),
      // Checkout drop-off events count
      Analytics.countDocuments({ event: "checkout_dropoff", createdAt: { $gte: since } }),
      // Distinct sessions for product_view
      Analytics.distinct("sessionId", {
        event: "product_view",
        sessionId: { $ne: null },
        createdAt: { $gte: since }
      }),
      // Distinct sessions for add_to_cart
      Analytics.distinct("sessionId", {
        event: "add_to_cart",
        sessionId: { $ne: null },
        createdAt: { $gte: since }
      }),
      // Distinct sessions for checkout_start
      Analytics.distinct("sessionId", {
        event: "checkout_start",
        sessionId: { $ne: null },
        createdAt: { $gte: since }
      }),
      // Server-verified total orders, revenue, and unique purchasing customers in the last 30 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: since },
            status: { $ne: "Cancelled" }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$pricing.total" },
            uniqueCustomers: { $addToSet: "$user" }
          }
        }
      ]),
      // Server-verified daily order trends (last 14 days)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dailySince },
            status: { $ne: "Cancelled" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$pricing.total" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const counts = Object.fromEntries(totals.map((t) => [t._id, t.count]));

    // Raw event touchpoints
    const views = counts.product_view || 0;
    const cartAdds = counts.add_to_cart || 0;
    const checkoutStarts = counts.checkout_start || 0;

    // Server-verified orders
    const verifiedOrderData = verifiedOrdersAgg[0] || { totalOrders: 0, totalRevenue: 0, uniqueCustomers: [] };
    const serverVerifiedOrdersCount = verifiedOrderData.totalOrders || 0;
    const serverVerifiedRevenue = verifiedOrderData.totalRevenue || 0;
    const uniqueCustomersCount = verifiedOrderData.uniqueCustomers?.length || 0;

    // Use verified orders count for the funnel orders, with fallback to tracking events if zero
    const finalOrdersCount = serverVerifiedOrdersCount > 0 ? serverVerifiedOrdersCount : (counts.order_placed || 0);

    // Session-based conversion calculations
    const uniqueVisitorSessions = distinctProductViewSessions.filter(Boolean).length;
    const uniqueCartSessions = distinctCartAddSessions.filter(Boolean).length;
    const uniqueCheckoutSessions = distinctCheckoutSessions.filter(Boolean).length;

    // Session-based Conversion Rates (if sessions are tracked, else event-based fallback)
    const sessionConversionRate = uniqueVisitorSessions > 0
      ? ((finalOrdersCount / uniqueVisitorSessions) * 100).toFixed(1)
      : (views > 0 ? ((finalOrdersCount / views) * 100).toFixed(1) : "0.0");

    const sessionCartToOrderRate = uniqueCartSessions > 0
      ? ((finalOrdersCount / uniqueCartSessions) * 100).toFixed(1)
      : (cartAdds > 0 ? ((finalOrdersCount / cartAdds) * 100).toFixed(1) : "0.0");

    const sessionCheckoutCompletionRate = uniqueCheckoutSessions > 0
      ? ((finalOrdersCount / uniqueCheckoutSessions) * 100).toFixed(1)
      : (checkoutStarts > 0 ? ((finalOrdersCount / checkoutStarts) * 100).toFixed(1) : "0.0");

    // Standard event-based rates
    const overallConvRate = views > 0 ? ((finalOrdersCount / views) * 100).toFixed(1) : "0.0";
    const cartToOrderRate = cartAdds > 0 ? ((finalOrdersCount / cartAdds) * 100).toFixed(1) : "0.0";
    const checkoutCompletionRate = checkoutStarts > 0 ? ((finalOrdersCount / checkoutStarts) * 100).toFixed(1) : "0.0";

    res.json({
      success: true,
      period: "last_30_days",
      counts: {
        ...counts,
        order_placed: finalOrdersCount
      },
      funnel: {
        views,
        cartAdds,
        checkoutStarts,
        orders: finalOrdersCount,
        dropoffs: dropoffCount || Math.max(0, checkoutStarts - finalOrdersCount)
      },
      // Preserved rates structure expected by existing admin Dashboard UI
      rates: {
        overall: overallConvRate,
        cartToOrder: cartToOrderRate,
        checkoutCompletion: checkoutCompletionRate,
        sessionBased: {
          visitorToOrder: sessionConversionRate,
          cartToOrder: sessionCartToOrderRate,
          checkoutCompletion: sessionCheckoutCompletionRate,
          uniqueVisitors: uniqueVisitorSessions,
          uniqueCartUsers: uniqueCartSessions,
          uniqueCheckoutUsers: uniqueCheckoutSessions
        }
      },
      verifiedOrderMetrics: {
        totalOrders: serverVerifiedOrdersCount,
        totalRevenue: serverVerifiedRevenue,
        uniquePurchasers: uniqueCustomersCount,
        period: "last_30_days"
      },
      daily: verifiedDailyOrders.length > 0 ? verifiedDailyOrders : [],
      topProducts,
    });
  } catch (err) {
    // Safe server error logging without leaking internals
    console.error("Analytics summary retrieval error:", err);
    res.status(500).json({ success: false, message: "Unable to retrieve analytics summary at this time" });
  }
};
