// ═══════════════════════════════════════════════════════════════
// JSDOC EXAMPLES - Add to existing backend files
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// 1. backend/utils/auth.utils.js (or wherever extractUser is)
// ───────────────────────────────────────────────────────────────

/**
 * Extract user data from JWT payload
 * Safely handles missing or malformed payload data
 * 
 * @param {Object} payload - JWT decoded payload
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.username - Username
 * @param {string} payload.role - User role (user, editor, admin, superadmin)
 * @returns {Object} User object without sensitive data
 * @example
 * const user = extractUser({ id: '123', email: 'test@test.com', role: 'user' });
 * // Returns: { id: '123', email: 'test@test.com', role: 'user' }
 */
const extractUser = (payload) => {
  return {
    id: payload.id,
    email: payload.email,
    username: payload.username,
    role: payload.role,
  };
};

/**
 * Extract and validate JWT token from Authorization header
 * Supports "Bearer <token>" format
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header
 * @returns {string|null} JWT token or null if invalid
 * @example
 * const token = extractToken(req);
 * if (!token) return res.status(401).json({ message: 'No token' });
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// ───────────────────────────────────────────────────────────────
// 2. backend/controllers/energy.controller.js
// ───────────────────────────────────────────────────────────────

/**
 * Fetch energy entries with filters and pagination
 * Supports: search, source filter, date range, sorting
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search] - Search term for source
 * @param {string} [req.query.source] - Filter by energy source
 * @param {string} [req.query.startDate] - Filter start date (ISO format)
 * @param {string} [req.query.endDate] - Filter end date (ISO format)
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=15] - Items per page
 * @param {string} [req.query.sortBy=date] - Sort field
 * @param {string} [req.query.sortOrder=desc] - Sort direction
 * @param {Object} req.user - Authenticated user (from middleware)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 * @throws {400} Invalid date format
 * @throws {500} Database error
 */
const fetchEntries = async (req, res) => {
  // Implementation...
};

/**
 * Fetch aggregated energy statistics
 * Calculates: total kWh, CO2, cost, average, by-source breakdown
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.period=30d] - Time period (7d, 30d, 90d, 1y, all)
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 * @example
 * GET /api/energy/stats?period=30d
 * // Returns: { totals: {...}, bySource: [...], period: '30d' }
 */
const fetchStats = async (req, res) => {
  // Implementation...
};

/**
 * Fetch chart data for visualizations
 * Groups entries by date and calculates daily totals
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.period=30d] - Time period
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 * @example
 * GET /api/energy/chart?period=7d
 * // Returns: { chart: [{date, kWh, co2Emitted, co2Avoided}] }
 */
const fetchChartData = async (req, res) => {
  // Implementation...
};

// ───────────────────────────────────────────────────────────────
// 3. backend/middleware/auth.middleware.js
// ───────────────────────────────────────────────────────────────

/**
 * Protect route with JWT authentication
 * Validates token, checks user existence, attaches user to req
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 * @throws {401} No token provided
 * @throws {401} Invalid token
 * @throws {401} User not found
 * @example
 * router.get('/protected', protect, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
const protect = async (req, res, next) => {
  // Implementation...
};

/**
 * Authorize user by role
 * Must be used after protect middleware
 * 
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 * @example
 * router.delete('/admin', protect, authorize('admin', 'superadmin'), deleteUser);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to access this resource' 
      });
    }
    next();
  };
};

// ───────────────────────────────────────────────────────────────
// 4. backend/models/EnergyData.model.js
// ───────────────────────────────────────────────────────────────

/**
 * Calculate CO2 emissions based on energy source
 * Uses standard emission factors (kg CO2 per kWh)
 * 
 * @param {string} source - Energy source name
 * @param {number} kWh - Energy consumption in kilowatt-hours
 * @returns {number} CO2 emissions in kg
 * @example
 * const co2 = calculateCO2('Solar', 100);
 * // Returns: 5 (kg CO2)
 */
energyDataSchema.methods.calculateCO2 = function() {
  const emissionFactors = {
    Solar: 0.05,
    Wind: 0.02,
    Hydro: 0.024,
    Biomass: 0.23,
    Geothermal: 0.038,
    Grid: 0.475,
  };
  
  const factor = emissionFactors[this.source] || 0.475;
  return this.kWh * factor;
};
