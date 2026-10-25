import express from "express";
import rateLimit from "express-rate-limit";
import { trackEvent, getSummary } from "../controller/analyticsController.js";
import { verifyUser, isAdmin } from "../helper/userAuth.js";

const router = express.Router();

/**
 * Rate limit public analytics ingestion:
 * Allow up to 120 analytics events per 1 minute window per IP.
 * Prevents event spam and DOS without impeding normal single-page application browsing.
 */
const analyticsIngestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many analytics requests" }
});

/**
 * Payload limit middleware:
 * Public /event payload must be strictly limited to max 10KB.
 */
const jsonPayloadLimit = express.json({ limit: "10kb" });

// Public — fire-and-forget event ingestion (rate limited, payload limited)
router.post("/event", analyticsIngestLimiter, jsonPayloadLimit, trackEvent);

// Admin only — summary dashboard
router.get("/analytics/summary", verifyUser, isAdmin, getSummary);

export default router;
