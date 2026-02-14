import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import config from "./config/config.js";
import connectDB, { disconnectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import correlationId from "./middleware/correlationId.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import energyRoutes from "./routes/energy.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.js";

const app = express();

app.set("trust proxy", 1);
app.disable("etag");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: config.env === "production" ? undefined : false,
  })
);

app.use(compression());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = Array.isArray(config.cors.origin) 
      ? config.cors.origin 
      : [config.cors.origin];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Correlation-ID',
    'X-Requested-With',
  ],
};

app.use(cors(corsOptions));

app.use("/api", (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(correlationId);

app.use(
  morgan("short", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url.startsWith("/api/health"),
  })
);

app.use("/api", apiLimiter);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Route non trovata: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      const len = 53;
      const pad = (str, w) => String(str).padEnd(w);

      console.log("");
      console.log("\x1b[32m  ╔" + "═".repeat(len) + "╗\x1b[0m");
      console.log(
        "\x1b[32m  ║\x1b[0m                                                       \x1b[32m║\x1b[0m"
      );
      console.log(
        "\x1b[32m  ║\x1b[0m   \x1b[1m\x1b[32m🌱 GREEN CORE AUREA\x1b[0m \x1b[2mv5.2\x1b[0m                              \x1b[32m║\x1b[0m"
      );
      console.log(
        "\x1b[32m  ║\x1b[0m                                                       \x1b[32m║\x1b[0m"
      );
      console.log(
        "\x1b[32m  ║\x1b[0m   \x1b[2mStatus\x1b[0m    \x1b[32m● online\x1b[0m                                  \x1b[32m║\x1b[0m"
      );
      console.log(
        `\x1b[32m  ║\x1b[0m   \x1b[2mMode\x1b[0m      ${pad(
          config.env,
          38
        )}    \x1b[32m║\x1b[0m`
      );
      console.log(
        `\x1b[32m  ║\x1b[0m   \x1b[2mPort\x1b[0m      \x1b[1m${pad(
          config.port,
          38
        )}\x1b[0m    \x1b[32m║\x1b[0m`
      );
      console.log(
        `\x1b[32m  ║\x1b[0m   \x1b[2mCORS\x1b[0m      ${pad(
          String(config.cors.origin).substring(0, 36),
          38
        )}    \x1b[32m║\x1b[0m`
      );
      console.log(
        "\x1b[32m  ║\x1b[0m                                                       \x1b[32m║\x1b[0m"
      );
      console.log("\x1b[32m  ╚" + "═".repeat(len) + "╝\x1b[0m");
      console.log("");
    });

    const shutdown = async (signal) => {
      console.log("");
      console.log("\x1b[33m  ╔" + "═".repeat(53) + "╗\x1b[0m");
      console.log(
        "\x1b[33m  ║\x1b[0m                                                       \x1b[33m║\x1b[0m"
      );
      console.log(
        "\x1b[33m  ║\x1b[0m   \x1b[1m\x1b[33m⏻  SHUTTING DOWN\x1b[0m                                    \x1b[33m║\x1b[0m"
      );
      console.log(
        "\x1b[33m  ║\x1b[0m                                                       \x1b[33m║\x1b[0m"
      );
      console.log(
        `\x1b[33m  ║\x1b[0m   \x1b[2mSignal\x1b[0m    \x1b[33m${String(
          signal
        ).padEnd(38)}\x1b[0m    \x1b[33m║\x1b[0m`
      );
      console.log(
        "\x1b[33m  ║\x1b[0m   \x1b[2mServer\x1b[0m    \x1b[2mclosing connections...\x1b[0m                      \x1b[33m║\x1b[0m"
      );

      server.close(async () => {
        console.log(
          "\x1b[33m  ║\x1b[0m   \x1b[2mDB\x1b[0m        \x1b[2mdisconnecting...\x1b[0m                            \x1b[33m║\x1b[0m"
        );
        await disconnectDB();
        console.log(
          "\x1b[33m  ║\x1b[0m                                                       \x1b[33m║\x1b[0m"
        );
        console.log(
          "\x1b[33m  ║\x1b[0m   \x1b[2mStatus\x1b[0m    \x1b[31m● offline\x1b[0m                                 \x1b[33m║\x1b[0m"
        );
        console.log(
          "\x1b[33m  ║\x1b[0m                                                       \x1b[33m║\x1b[0m"
        );
        console.log("\x1b[33m  ╚" + "═".repeat(53) + "╝\x1b[0m");
        console.log("");
        process.exit(0);
      });

      setTimeout(() => {
        console.log("\x1b[31m  ⚠ Force shutdown (timeout 10s)\x1b[0m");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
}

startServer();

export default app;
