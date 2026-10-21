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

const app = express();
app.use(cookieParser());
app.use(cors())
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
