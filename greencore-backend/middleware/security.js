// backend/middleware/security.js
const helmet = require('helmet');
const config = require('../config/runtime');


const httpsRedirect = (req, res, next) => {
  if (config.security.enforceHttps && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};


const cspConfig = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    
    // Scripts: self + inline (needed for Vite HMR in dev)
    scriptSrc: ["'self'", "'unsafe-inline'"],
    
    // Styles: self + inline (Tailwind needs this)
    styleSrc: ["'self'", "'unsafe-inline'"],
    
    // Images: self + data URIs + any HTTPS
    imgSrc: ["'self'", 'data:', 'https:'],
    
    // Fonts: self + data URIs
    fontSrc: ["'self'", 'data:'],
    
    // Connect (API calls): self + OAuth providers
    connectSrc: [
      "'self'",
      'https://accounts.google.com',
      'https://github.com',
      'https://api.github.com',
    ],
    
    // Frames (OAuth popups): self + OAuth providers
    frameSrc: [
      "'self'",
      'https://accounts.google.com',
    ],
    
    // Form actions: self (login, register forms)
    formAction: ["'self'"],
    
    // Base URI: self
    baseUri: ["'self'"],
    
    // Object/Embed: none (no Flash/Java)
    objectSrc: ["'none'"],
  },
  

  reportOnly: false,
});

const securityHeaders = helmet({
  // Content Security Policy (configured above)
  contentSecurityPolicy: false, // We'll apply custom CSP separately
  
  // X-DNS-Prefetch-Control: off
  dnsPrefetchControl: { allow: false },
  
  // X-Frame-Options: DENY
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By
  hidePoweredBy: true,
  
  // Strict-Transport-Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Content-Type-Options: nosniff
  noSniff: true,
  
  // Referrer-Policy: strict-origin-when-cross-origin
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // X-XSS-Protection: 0 (modern browsers use CSP)
  xssFilter: false,
});

/**
 * Combined Security Middleware
 * Apply all security headers in correct order
 */
const applySecurity = (app) => {
  // 1. HTTPS redirect (first, before any processing)
  if (config.security.enforceHttps) {
    app.use(httpsRedirect);
  }
  
  // 2. General security headers
  app.use(securityHeaders);
  
  // 3. CSP (separate for easier debugging)
  app.use(cspConfig);
  
  // 4. Additional custom headers
  app.use((req, res, next) => {
    // Permissions-Policy (replaces Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
    
    next();
  });
};

module.exports = {
  applySecurity,
  httpsRedirect,
  cspConfig,
  securityHeaders,
};
