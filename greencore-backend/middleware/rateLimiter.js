import rateLimit from 'express-rate-limit';

const keyGen = (req) => req.ip || 'unknown';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGen,
  message: { success: false, code: 'RATE_LIMIT', message: 'Troppe richieste. Riprova tra 15 minuti.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGen,
  message: { success: false, code: 'RATE_LIMIT', message: 'Troppi tentativi. Riprova tra 15 minuti.' },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGen,
  message: { success: false, code: 'RATE_LIMIT', message: "Troppi tentativi di reset. Riprova tra un'ora." },
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMIT', message: 'Troppe richieste newsletter.' },
});
