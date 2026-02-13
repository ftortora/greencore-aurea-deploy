import express from "express";
import mongoose from "mongoose";

const router = express.Router();


router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


router.get("/advanced", async (req, res) => {
  try {
    const dbState =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    const memory = process.memoryUsage();

    res.json({
      success: true,
      status: "ok",
      database: dbState,
      memory: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: "error",
      message: "Service degraded",
    });
  }
});

export default router;
