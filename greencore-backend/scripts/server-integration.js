// ═══════════════════════════════════════════════════════════════
// backend/server.js - INTEGRATION CHANGES
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// ADD at the top (after existing requires)
// ───────────────────────────────────────────────────────────────

const { applySecurity } = require('./middleware/security');
const config = require('./config/runtime');

// ───────────────────────────────────────────────────────────────
// REPLACE helmet() with security middleware
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE (remove or comment out):
// app.use(helmet());

// ✅ AFTER (add this instead):
// Apply comprehensive security headers (CSP, HTTPS redirect, etc.)
applySecurity(app);

// ───────────────────────────────────────────────────────────────
// UPDATE rate limiting to use config
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE:
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// }));

// ✅ AFTER:
app.use(rateLimit({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  message: 'Too many requests from this IP, please try again later.',
}));

// ───────────────────────────────────────────────────────────────
// UPDATE compression to use config
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE:
// app.use(compression());

// ✅ AFTER:
app.use(compression({
  level: config.compression.level,
  threshold: config.compression.threshold,
}));

// ───────────────────────────────────────────────────────────────
// REPLACE health route with new advanced version
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE (remove old health route):
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', uptime: process.uptime() });
// });

// ✅ AFTER (use new router):
const healthRouter = require('./routes/health');
app.use('/api/health', healthRouter);
// Now supports:
// GET /api/health         - Basic check
// GET /api/health/advanced - Detailed check with DB

// ───────────────────────────────────────────────────────────────
// FULL EXAMPLE: Updated middleware section
// ───────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { applySecurity } = require('./middleware/security');
const config = require('./config/runtime');

const app = express();

// ═══════════════════════════════════════════════
// SECURITY (First!)
// ═══════════════════════════════════════════════
applySecurity(app);

// ═══════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL,
  credentials: true,
  maxAge: config.cors.maxAge,
}));

// ═══════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════
app.use(rateLimit({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  message: 'Too many requests, please try again later.',
}));

// ═══════════════════════════════════════════════
// BODY PARSING
// ═══════════════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ═══════════════════════════════════════════════
// COMPRESSION
// ═══════════════════════════════════════════════
app.use(compression({
  level: config.compression.level,
  threshold: config.compression.threshold,
}));

// ═══════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════
const healthRouter = require('./routes/health');
const authRoutes = require('./routes/auth.routes');
const energyRoutes = require('./routes/energy.routes');
// ... other routes

app.use('/api/health', healthRouter);
app.use('/api/auth', authRoutes);
app.use('/api/energy', energyRoutes);
// ... other routes

// ═══════════════════════════════════════════════
// ERROR HANDLING (Last!)
// ═══════════════════════════════════════════════
const { errorHandler } = require('./middleware/error.middleware');
app.use(errorHandler);

// ... rest of server.js
