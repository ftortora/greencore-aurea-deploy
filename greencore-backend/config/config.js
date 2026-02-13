import dotenv from 'dotenv';
dotenv.config();

function req(key, fb) {
  const v = process.env[key] || fb;
  if (!v) { console.error(`FATAL: Missing ${key}`); process.exit(1); }
  return v;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 10000,
  mongoUri: req('MONGODB_URI'),
  mongoOptions: {
    maxPoolSize: 10, minPoolSize: 2,
    serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000,
    family: 4, retryWrites: true, retryReads: true,
  },
  jwt: {
    secret: req('JWT_SECRET'),
    refreshSecret: req('JWT_REFRESH_SECRET'),
    expire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  accountLockout: {
    maxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS, 10) || 5,
    lockDurationMs: parseInt(process.env.LOCKOUT_DURATION_MS, 10) || 1800000,
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@greencore.com',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};

export default config;
