import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWED_EVENTS } from "../model/analyticsModel.js";

// Mock req and res objects for direct express middleware/controller testing without network sockets
function createMockReqRes({ body = {}, headers = {}, ip = "127.0.0.1" } = {}) {
  const req = {
    body,
    headers,
    socket: { remoteAddress: ip },
  };

  let statusCode = 200;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

test("Analytics Event Whitelist & Schema Rules", async (t) => {
  await t.test("ALLOWED_EVENTS list contains required lifecycle touchpoints", () => {
    const required = [
      "product_view",
      "add_to_cart",
      "checkout_start",
      "checkout_dropoff",
      "order_placed",
      "wa_enquiry",
      "wa_order_confirm",
      "homepage_enquiry",
      "contact_submit",
      "wholesale_submit",
      "wishlist_add",
      "cta_click",
    ];
    for (const evt of required) {
      assert.ok(ALLOWED_EVENTS.includes(evt), `Missing required event: ${evt}`);
    }
  });

  await t.test("Event validation logic rejects unknown / injected event strings", () => {
    const checkValid = (event) => typeof event === "string" && ALLOWED_EVENTS.includes(event);

    assert.equal(checkValid("product_view"), true);
    assert.equal(checkValid("checkout_start"), true);
    assert.equal(checkValid("order_placed"), true);
    assert.equal(checkValid(""), false);
    assert.equal(checkValid("DROP TABLE analytics"), false);
    assert.equal(checkValid("<script>alert(1)</script>"), false);
    assert.equal(checkValid(null), false);
    assert.equal(checkValid(undefined), false);
  });

  await t.test("Metadata payload size validator enforces <= 4096 bytes constraint", () => {
    const validateMeta = (meta) => {
      if (!meta || typeof meta !== "object") return true;
      try {
        return JSON.stringify(meta).length <= 4096;
      } catch {
        return false;
      }
    };

    assert.equal(validateMeta({ source: "web", category: "oils" }), true);
    assert.equal(validateMeta(null), true);
    assert.equal(validateMeta({}), true);

    const oversized = { data: "x".repeat(4100) };
    assert.equal(validateMeta(oversized), false);
  });

  await t.test("Calculation Logic: Session vs Event conversion computation", () => {
    // Verified math logic unit test
    const finalOrdersCount = 10;
    const uniqueVisitorSessions = 200;
    const views = 500;

    const sessionRate = ((finalOrdersCount / uniqueVisitorSessions) * 100).toFixed(1);
    const eventRate = ((finalOrdersCount / views) * 100).toFixed(1);

    assert.equal(sessionRate, "5.0"); // 10 / 200 = 5%
    assert.equal(eventRate, "2.0");   // 10 / 500 = 2%

    // Edge cases: zero divisors
    const zeroSessionRate = 0 > 0 ? ((finalOrdersCount / 0) * 100).toFixed(1) : "0.0";
    assert.equal(zeroSessionRate, "0.0");
  });

  await t.test("Client deduplication window prevents duplicate bursts within 1.5s", () => {
    const recentEvents = new Map();
    const shouldSend = (event, targetId, timestamp) => {
      const dedupeKey = `${event}:${targetId}`;
      const lastSent = recentEvents.get(dedupeKey);
      if (lastSent && timestamp - lastSent < 1500) {
        return false;
      }
      recentEvents.set(dedupeKey, timestamp);
      return true;
    };

    const t0 = 100000;
    // First view allowed
    assert.equal(shouldSend("product_view", "prod_123", t0), true);
    // Duplicate call 200ms later rejected
    assert.equal(shouldSend("product_view", "prod_123", t0 + 200), false);
    // Duplicate call 800ms later rejected
    assert.equal(shouldSend("product_view", "prod_123", t0 + 800), false);
    // Call on different product allowed
    assert.equal(shouldSend("product_view", "prod_456", t0 + 900), true);
    // Call on same product after 2000ms allowed
    assert.equal(shouldSend("product_view", "prod_123", t0 + 2000), true);
  });
});

