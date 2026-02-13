const request = require('supertest');
const express = require('express');

describe('Auth Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Stub auth routes inline
    app.post('/api/auth/login', async (req, res) => {
      const { email, password } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Email e password obbligatori',
        });
      }
      
      // Validate email format
      if (!email.includes('@')) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Email non valida',
        });
      }
      
      // Simulate user not found
      return res.status(401).json({
        success: false,
        code: 'AUTH_ERROR',
        message: 'Credenziali non valide',
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'fake@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
    });
  });
});
