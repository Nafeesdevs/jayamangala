import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import category from "./route/categoryRoute.js"
import brand from "./route/brandRoute.js"
import product from "./route/productRoute.js"
import user from "./route/userRoute.js"
import whislist from "./route/whislistRoute.js"
import cart from "./route/cartRoute.js"
import order from "./route/orderRoute.js"
import payment from "./route/paymentRoute.js"
import health from "./route/healthRoute.js"
import lead from "./route/leadRoute.js"
import quotation from "./route/quotationRoute.js"
import analytics from "./route/analyticsRoute.js"

const app = express();
// Behind Render/Vercel reverse proxies, trust the proxy header so express-rate-limit and IP hashing work correctly
app.set("trust proxy", 1);
app.use(cookieParser());

// ── CORS ────────────────────────────────────────────────────────────────────
// Production: Strict origin allowlist with regex support for preview deployments.
const isProd = process.env.NODE_ENV === "production";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Authorized development origins
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);

    const allowed = [...DEV_ORIGINS, ...ALLOWED_ORIGINS];

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    // In production, allow authorized Vercel preview domains if enabled
    if (isProd && process.env.ALLOW_VERCEL_PREVIEWS === "true") {
      if (/^https://[a-zA-Z0-9_-]+.vercel.app$/.test(origin)) {
        return callback(null, true);
      }
    }

    // In local development mode only, allow localhost variants
    if (!isProd) {
      if (/^http://(localhost|127.0.0.1)(:d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));
// ── END CORS ─────────────────────────────────────────────────────────────────

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/", health)
app.use("/api/v1/", category)
app.use("/api/v1/", brand)
app.use("/api/v1/", product)
app.use("/api/v1/", user)
app.use("/api/v1/", whislist)
app.use("/api/v1/", cart)
app.use("/api/v1/", payment)
app.use("/api/v1/", order)
app.use("/api/v1/", lead)
app.use("/api/v1/", quotation)
app.use("/api/v1/", analytics)

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// global error handler (multer errors, bad json, etc.)
app.use((err, req, res, next) => {
    const status = err.name === "MulterError" || err.type === "entity.parse.failed" ? 400 : (err.status || 500);
    res.status(status).json({ success: false, message: err.message });
});

export default app;
