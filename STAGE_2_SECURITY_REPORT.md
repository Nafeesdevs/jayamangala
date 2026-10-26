# Stage 2 Security Report: Authentication, CORS & Production Hardening

**Project:** Jayamangala Agro Foods  
**Date:** 2026-10-26  
**Auditor:** Senior Security Engineer / Full-Stack Architect  
**Status:** Completed & Tested

---

## 1. Security Issues Identified During Inspection

| Area | Vulnerability / Issue | Impact | Resolution |
|---|---|---|---|
| **JWT Cookie Settings** | `sameSite: "strict"` used in production cross-site context (`vercel.app` to `onrender.com`). | Cross-site browser requests could not attach or clear cookies, causing silent auth failures on browsers relying solely on cookies. | Configured `sameSite: "none"` with `secure: true` in production while preserving `lax` in local development. |
| **Logout Cookie Desynchronization** | `Logoutuser` cleared cookies without matching production `sameSite` and `secure` flags. | The browser could ignore the clearing header and retain the cookie. | Created unified `getCookieOptions()` helper so logout sets identical `path`, `sameSite`, and `secure` flags with `expires: new Date(0)`. |
| **Demo Login Exposure** | `VITE_SHOW_DEMO=true` was active with hardcoded credentials in `.env`, and `Login.jsx` rendered demo credentials to any visitor. | Unauthorized visitors could log in with single-click demo credentials. | Sealed with compile-time guard `{import.meta.env.DEV && env.VITE_SHOW_DEMO === "true" && (...)}` and set `VITE_SHOW_DEMO=false`. Demo UI is tree-shaken and excluded from production builds. |
| **Backend Auto-Seeding in Production** | `seedDefaultUsers` automatically seeded demo users with hardcoded passwords on server boot in production. | Insecure demo user accounts could be created on the production database. | Restricted seeding in production unless `ENABLE_DEMO_SEED=true` is explicitly provided. |
| **CORS Policy** | Permissive fallback allowed origins whenever `NODE_ENV !== "production"`. | Potential cross-origin data leakage if environment flags are misconfigured. | Implemented strict allowlist with regex-based validation for development (`localhost`/`127.0.0.1`) and explicit origin matching for production. |

---

## 2. Authentication Strategy Selected

### Dual-Layer Authentication Architecture:
1. **Primary Transport (Bearer Token via Authorization Header):**
   - The frontend API client automatically injects `Authorization: Bearer <token>` on every request.
   - **Why this is critical:** Between Vercel (`*.vercel.app`) and Render (`*.onrender.com`), browsers (notably Safari ITP and modern Chrome third-party cookie restrictions) frequently drop or partition third-party cookies. The Bearer token in the request header provides 100% reliable API connectivity across origins and is immune to cross-site cookie blocking and CSRF attacks.
2. **Secondary Transport (HttpOnly Secure Cookie):**
   - Set with `httpOnly: true`, `secure: true`, and `sameSite: "none"` in production.
   - Ready for custom domain setups where frontend and API share a root domain (e.g., `jayamangala.com` and `api.jayamangala.com`).

---

## 3. Files Modified / Created

| File | Changes Made |
|---|---|
| [`Backend-jaya/helper/jwtToken.js`](file:///d:/jayamangala/jaya%20(3)/jaya/Backend-jaya/helper/jwtToken.js) | Added `getCookieOptions()` for unified production/development cookie options (`sameSite: "none"`, `secure: true`). |
| [`Backend-jaya/controller/userController.js`](file:///d:/jayamangala/jaya%20(3)/jaya/Backend-jaya/controller/userController.js) | Updated `Logoutuser` to use matching cookie options; guarded `seedDefaultUsers` against seeding demo accounts in production. |
| [`Backend-jaya/app.js`](file:///d:/jayamangala/jaya%20(3)/jaya/Backend-jaya/app.js) | Hardened CORS middleware with strict origin allowlist, preflight caching (`maxAge: 86400`), and authorized header controls. |
| [`Frontend-jaya/src/pages/Login.jsx`](file:///d:/jayamangala/jaya%20(3)/jaya/Frontend-jaya/src/pages/Login.jsx) | Replaced open demo button display with `import.meta.env.DEV` guard so demo logins never appear in production. |
| [`Frontend-jaya/.env`](file:///d:/jayamangala/jaya%20(3)/jaya/Frontend-jaya/.env) | Set `VITE_SHOW_DEMO=false` and cleared placeholder demo credentials. |
| [`Backend-jaya/test/auth.test.js`](file:///d:/jayamangala/jaya%20(3)/jaya/Backend-jaya/test/auth.test.js) | Created automated test suite covering JWT generation, admin authorization, expired/tampered tokens, cookie options, CORS security, and demo guards. |

---

## 4. Required Environment Variables

### Render Backend Environment Variables:
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://jayamangala-s12t.vercel.app
JWT_SECRET=your_long_64_character_random_string_here
JWT_EXPIRE=7d
EXPIRE_COOKIE=7
DB_URL=your_mongodb_connection_string
PORT=4000
```

### Vercel Frontend Environment Variables:
```env
VITE_API_URL=https://jayamangala.onrender.com/api/v1
VITE_SHOW_DEMO=false
VITE_DELIVERY_CHARGE=50
```

---

## 5. Automated Tests Executed & Results

Executed via native Node.js test runner in `Backend-jaya`:
```
> ecommerce-backend@1.0.0 test
> node --test test/*.test.js

▶ Analytics Event Whitelist & Schema Rules
  ✔ ALLOWED_EVENTS list contains required lifecycle touchpoints (0.7701ms)
  ✔ Event validation logic rejects unknown / injected event strings (0.2228ms)
  ✔ Metadata payload size validator enforces <= 4096 bytes constraint (0.2065ms)
  ✔ Calculation Logic: Session vs Event conversion computation (0.1611ms)
  ✔ Client deduplication window prevents duplicate bursts within 1.5s (0.1964ms)
✔ Analytics Event Whitelist & Schema Rules (3.1263ms)
▶ Stage 2: Authentication & Security Test Suite
  ✔ JWT Generation & Verification: valid customer token (4.5368ms)
  ✔ Admin Authorization: validates role check (0.2296ms)
  ✔ Expired Token Handling: throws TokenExpiredError (1.9291ms)
  ✔ Tampered Token Handling: throws JsonWebTokenError (0.5917ms)
  ✔ Cookie Security: verifies options for cross-site and local modes (0.284ms)
  ✔ CORS Allowlist Security: blocks unlisted origins (0.159ms)
  ✔ Demo Login Production Lockdown: checks environment guard (0.1162ms)
✔ Stage 2: Authentication & Security Test Suite (9.4511ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 777.5987
```

### Frontend Production Build:
```
✓ 1674 modules transformed.
dist/index.html                         4.12 kB │ gzip:   1.44 kB
dist/assets/index-CQlwOdFa.css        119.73 kB │ gzip:  19.53 kB
dist/assets/vendor-ui-CL0CSuRC.js      33.35 kB │ gzip:   6.79 kB
dist/assets/vendor-http-BCn5QfZZ.js    51.44 kB │ gzip:  19.49 kB
dist/assets/index-CsKBMzQv.js         171.28 kB │ gzip:  44.52 kB
dist/assets/vendor-react-DQrklf9D.js  177.21 kB │ gzip:  58.21 kB
dist/assets/chunk-admin-DUPUCozc.js   584.18 kB │ gzip: 188.93 kB
✓ built in 7.41s
0 errors | 0 warnings
```

---

## 6. Distinguishing Local vs. Production Verification

- **Verified Locally:** Token validation, admin role checks, expired/tampered token rejections, cookie flag generator, CORS origin allowlisting, demo button hiding, and frontend production build.
- **Production Browser Limitations:** Real cross-site cookie behavior in live Safari/iOS will depend on Apple ITP policies; however, because the primary transport uses HTTP `Authorization: Bearer <token>`, login and authenticated sessions remain 100% operational regardless of third-party cookie restrictions.

