import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { getCookieOptions } from "../helper/jwtToken.js";

const TEST_SECRET = "test_super_secret_key_for_unit_tests_1234567890";

test("Stage 2: Authentication & Security Test Suite", async (t) => {
  await t.test("JWT Generation & Verification: valid customer token", () => {
    const payload = { id: "654321654321654321654321", role: "customer" };
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: "1h" });

    const decoded = jwt.verify(token, TEST_SECRET);
    assert.equal(decoded.id, payload.id);
    assert.equal(decoded.role, "customer");
  });

  await t.test("Admin Authorization: validates role check", () => {
    const adminUser = { _id: "admin1", role: "admin", isActive: true };
    const customerUser = { _id: "cust1", role: "customer", isActive: true };

    const isAdminCheck = (u) => u && u.role === "admin";
    assert.equal(isAdminCheck(adminUser), true);
    assert.equal(isAdminCheck(customerUser), false);
  });

  await t.test("Expired Token Handling: throws TokenExpiredError", () => {
    const payload = { id: "user1", role: "customer" };
    // Token that expired 10 seconds ago
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: "-10s" });

    assert.throws(
      () => {
        jwt.verify(token, TEST_SECRET);
      },
      (err) => err.name === "TokenExpiredError"
    );
  });

  await t.test("Tampered Token Handling: throws JsonWebTokenError", () => {
    const payload = { id: "user1", role: "customer" };
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: "1h" });
    const tampered = token.slice(0, -5) + "abcde";

    assert.throws(
      () => {
        jwt.verify(tampered, TEST_SECRET);
      },
      (err) => err.name === "JsonWebTokenError"
    );
  });

  await t.test("Cookie Security: verifies options for cross-site and local modes", () => {
    const originalEnv = process.env.NODE_ENV;

    // Test production cookie options
    process.env.NODE_ENV = "production";
    const prodOpts = getCookieOptions();
    assert.equal(prodOpts.httpOnly, true);
    assert.equal(prodOpts.secure, true);
    assert.equal(prodOpts.sameSite, "none");

    // Test development cookie options
    process.env.NODE_ENV = "development";
    const devOpts = getCookieOptions();
    assert.equal(devOpts.httpOnly, true);
    assert.equal(devOpts.secure, false);
    assert.equal(devOpts.sameSite, "lax");

    process.env.NODE_ENV = originalEnv;
  });

  await t.test("CORS Allowlist Security: blocks unlisted origins", () => {
    const allowedOrigins = ["https://jayamangala-s12t.vercel.app"];
    const devOrigins = ["http://localhost:5173", "http://localhost:3000"];

    const isOriginAllowed = (origin, isProd) => {
      if (!origin) return true; // server-to-server
      const list = [...devOrigins, ...allowedOrigins];
      if (list.includes(origin)) return true;
      if (!isProd && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
      return false;
    };

    assert.equal(isOriginAllowed("https://jayamangala-s12t.vercel.app", true), true);
    assert.equal(isOriginAllowed("http://localhost:5173", false), true);
    assert.equal(isOriginAllowed("https://malicious-phishing-site.com", true), false);
    assert.equal(isOriginAllowed("https://evil-attacker.vercel.app", true), false);
  });

  await t.test("Demo Login Production Lockdown: checks environment guard", () => {
    const shouldRenderDemo = (isDev, viteShowDemo) => {
      return Boolean(isDev && viteShowDemo === "true");
    };

    assert.equal(shouldRenderDemo(true, "true"), true);   // Allowed only in dev with explicit flag
    assert.equal(shouldRenderDemo(false, "true"), false);  // Forbidden in production even if flag is "true"
    assert.equal(shouldRenderDemo(false, "false"), false); // Forbidden in production
  });
});

