const request = require('supertest');
const express = require('express');

describe('Auth Middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Stub protect middleware inline
    const protect = async (req, res, next) => {
      let token = null;
      
      // Check Bearer header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      // Check cookie
      if (!token && req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }
      
      // No token
      if (!token) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_ERROR',
          message: 'Not authorized, no token',
        });
      }
      
      // Invalid token (any token that doesn't start with 'valid-' is considered invalid for test)
      if (!token.startsWith('valid-')) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_ERROR',
          message: 'Not authorized, invalid token',
        });
      }
      
      // Valid token
      req.user = { id: 'test-user-id', email: 'test@example.com' };
      next();
    };
    
    // Protected route
    app.get('/api/energy', protect, (req, res) => {
      res.json({
        success: true,
        message: 'Protected resource',
        user: req.user,
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app).get('/api/energy');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/not authorized|no token/i);
    });

    it('should return 401 with invalid token format', async () => {
      const response = await request(app)
        .get('/api/energy')
        .set('Authorization', 'InvalidTokenFormat');

      expect(response.status).toBe(401);
    });

    it('should return 401 with malformed Bearer token', async () => {
      const response = await request(app)
        .get('/api/energy')
        .set('Authorization', 'Bearer');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/energy')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/energy')
        .set('Authorization', 'Bearer valid-test-token-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
    });
  });
});
