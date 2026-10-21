import mongoose from "mongoose";

export const healthCheck = (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = mongoose.connection.readyState;

    res.status(dbState === 1 ? 200 : 503).json({
        success: dbState === 1,
        status: dbState === 1 ? "OK" : "DEGRADED",
        message: "API is running",
        database: states[dbState],
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
};
