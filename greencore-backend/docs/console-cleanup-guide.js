// ═══════════════════════════════════════════════════════════════
// CONSOLE.LOG CLEANUP GUIDE
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// PATTERN 1: Development-only logs
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE (rimuovere):
console.log('Debug: user data', user);
console.log('[EnergyContext] fetching stats...');

// ✅ AFTER (sostituire con):
if (process.env.NODE_ENV !== 'production') {
  console.debug('[Dev] User data:', user);
}

// Or use existing logger:
const logger = require('../utils/logger');
logger.debug('User data:', user);

// ───────────────────────────────────────────────────────────────
// PATTERN 2: Error logs (KEEP but use logger)
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE:
console.error('Database error:', error);
console.log('Error details:', error.message);

// ✅ AFTER:
logger.error('Database error:', { error: error.message, stack: error.stack });

// ───────────────────────────────────────────────────────────────
// PATTERN 3: Info logs (use logger)
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE:
console.log('✅ Connected to MongoDB');
console.log('Server running on port', PORT);

// ✅ AFTER:
logger.info('Connected to MongoDB');
logger.info(`Server running on port ${PORT}`);

// ───────────────────────────────────────────────────────────────
// FILES TO CLEAN (Priority order)
// ───────────────────────────────────────────────────────────────

/*
HIGH PRIORITY (Production impact):
1. backend/server.js
   - Remove startup console.logs
   - Keep logger.info for important events

2. backend/controllers/*.js
   - Remove debug console.logs
   - Keep logger.error for errors
   - Use logger.debug for development

3. backend/middleware/*.js
   - Remove verbose logging
   - Keep critical errors only

MEDIUM PRIORITY (Development noise):
4. backend/routes/*.js
   - Minimal logging needed
   - Use logger.debug if needed

5. backend/utils/*.js
   - Remove debug logs
   - Keep error logging

LOW PRIORITY (Not critical):
6. backend/scripts/*.js
   - Console.log OK for scripts
   - These run manually
*/

// ───────────────────────────────────────────────────────────────
// AUTOMATED CLEANUP (Use with caution!)
// ───────────────────────────────────────────────────────────────

// Run this in backend/ to find all console.logs:
// grep -rn "console\.log" . --exclude-dir=node_modules --exclude-dir=tests

// Suggested replacements:
/*
1. Find: console.log\('✅
   Replace: logger.info('

2. Find: console.log\('❌
   Replace: logger.error('

3. Find: console.log\('\[
   Replace: logger.debug('[

4. Find: console.error\(
   Replace: logger.error(

5. Remove completely:
   console.log('Debug
   console.log('debug
   console.log('TEST
*/

// ───────────────────────────────────────────────────────────────
// EXAMPLE: Clean auth.controller.js
// ───────────────────────────────────────────────────────────────

// ❌ BEFORE:
const login = async (req, res) => {
  console.log('Login attempt:', req.body.email);
  const user = await User.findOne({ email });
  console.log('User found:', user);
  // ...
};

// ✅ AFTER:
const logger = require('../utils/logger');

const login = async (req, res) => {
  logger.debug('Login attempt', { email: req.body.email });
  const user = await User.findOne({ email });
  // Remove: console.log('User found:', user);
  // ...
};

// ───────────────────────────────────────────────────────────────
// KEEP THESE (Legitimate uses):
// ───────────────────────────────────────────────────────────────

// 1. Scripts (create-admin.js, create-indexes.js)
console.log('✅ Admin user created');

// 2. Server startup (if no logger available)
if (!logger) {
  console.log('Server starting...');
}

// 3. Critical errors (as fallback)
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});
