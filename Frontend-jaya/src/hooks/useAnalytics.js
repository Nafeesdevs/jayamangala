/**
 * useAnalytics — fire-and-forget conversion event tracker with session awareness and deduplication.
 *
 * Rules:
 * - NEVER throws or awaits a result that blocks the UI
 * - NEVER retries on failure
 * - Attaches a lightweight client session ID for accurate visitor/session conversion metrics
 * - Prevents rapid duplicate triggers for identical actions
 * - One exported function: track(event, payload?)
 */
import api from "../api/client";

const NOOP = () => {};

/**
 * Get or create a persistent session ID stored in sessionStorage (cleared on tab close).
 */
function getSessionId() {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    let sid = window.sessionStorage.getItem("jayamangala_sid");
    if (!sid) {
      sid = "s_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      window.sessionStorage.setItem("jayamangala_sid", sid);
    }
    return sid;
  } catch {
    return null;
  }
}

// In-memory debounce cache to prevent duplicate client calls within 1.5 seconds
const recentEvents = new Map();

/**
 * Fire a conversion event.
 * @param {string} event  One of the allowed event names
 * @param {object} [ctx]  Optional context { productId, productName, orderId, userId, lang }
 */
export function track(event, ctx = {}) {
  if (!event || typeof event !== "string") return;

  const sessionId = getSessionId();
  const targetId = ctx.productId || ctx.orderId || "";
  const dedupeKey = `${event}:${targetId}`;
  const now = Date.now();

  const lastSent = recentEvents.get(dedupeKey);
  if (lastSent && now - lastSent < 1500) {
    // Drop rapid duplicate client call
    return;
  }
  recentEvents.set(dedupeKey, now);

  // Clean old debounce entries periodically
  if (recentEvents.size > 50) {
    for (const [k, time] of recentEvents.entries()) {
      if (now - time > 10000) recentEvents.delete(k);
    }
  }

  // Fire and forget — do not await, do not surface errors
  api.post("/event", {
    event,
    sessionId,
    source: "web",
    ...ctx
  }).catch(NOOP);
}

/**
 * Convenience hook — returns `track` (stable reference, no re-renders).
 * Usage:
 *   const { track } = useAnalytics();
 *   track("product_view", { productId: p._id, productName: p.name });
 */
export function useAnalytics() {
  return { track };
}
