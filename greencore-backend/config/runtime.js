

module.exports = {

  auth: {
    // Password hashing
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    
    // JWT expiration
    jwtExpire: process.env.JWT_EXPIRE || '15m',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    
    // Account lockout
    lockout: {
      maxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS) || 5,
      durationMs: parseInt(process.env.LOCKOUT_DURATION_MS) || 30 * 60 * 1000, // 30 min
      resetAfterMs: 60 * 60 * 1000, // 1 hour - reset counter
    },
    
    // Password reset token
    resetToken: {
      expiryHours: 1,
      length: 32,
    },
  },

  // ═══════════════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════════════
  rateLimit: {
    // General API rate limit
    api: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 min
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },
    
    // Auth endpoints (stricter)
    auth: {
      windowMs: 15 * 60 * 1000, // 15 min
      max: 10, // 10 attempts per 15 min
    },
    
    // Password reset (very strict)
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
    },
  },

  // ═══════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════
  pagination: {
    defaultLimit: 15,
    maxLimit: 100,
  },

  // ═══════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════
  search: {
    minQueryLength: 2,
    maxQueryLength: 100,
  },

  // ═══════════════════════════════════════════════
  // FILE UPLOAD (future use)
  // ═══════════════════════════════════════════════
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },

  // ═══════════════════════════════════════════════
  // CACHING (future use)
  // ═══════════════════════════════════════════════
  cache: {
    ttl: 60 * 5, // 5 minutes
    statsCache: 60 * 10, // 10 minutes for stats
    chartCache: 60 * 15, // 15 minutes for charts
  },

  // ═══════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════
  health: {
    dbPingTimeout: 5000, // 5 seconds
  },

  // ═══════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    maxFiles: '14d',
    maxSize: '20m',
  },

  // ═══════════════════════════════════════════════
  // DATABASE
  // ═══════════════════════════════════════════════
  database: {
    retryAttempts: 5,
    retryDelayMs: 5000,
  },

  // ═══════════════════════════════════════════════
  // CORS
  // ═══════════════════════════════════════════════
  cors: {
    maxAge: 86400, // 24 hours
  },

  // ═══════════════════════════════════════════════
  // COMPRESSION
  // ═══════════════════════════════════════════════
  compression: {
    level: 6, // Balance between speed and compression
    threshold: 1024, // Only compress responses > 1KB
  },

  // ═══════════════════════════════════════════════
  // SECURITY
  // ═══════════════════════════════════════════════
  security: {
    // CSP nonce regeneration
    nonceLength: 16,
    
    // HTTPS redirect (production only)
    enforceHttps: process.env.NODE_ENV === 'production',
  },
};
