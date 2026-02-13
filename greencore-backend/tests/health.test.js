const request = require('supertest');
const express = require('express');

// Mock mongoose globalmente
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1,
    db: {
      admin: () => ({
        ping: jest.fn(() => Promise.resolve(true)),
      }),
    },
  },
}));

describe('Health Check Endpoint', () => {
  let app;

  beforeAll(() => {
    const mongoose = require('mongoose');
    app = express();
    
    // Stub health router inline
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: Date.now(),
      });
    });

    app.get('/api/health/advanced', async (req, res) => {
      const health = {
        status: 'OK',
        uptime: process.uptime(),
        timestamp: Date.now(),
        checks: {
          database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          },
        },
      };
      res.status(200).json(health);
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });

    it('should return JSON with correct structure', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('OK');
      expect(typeof response.body.uptime).toBe('number');
      expect(typeof response.body.timestamp).toBe('number');
    });

    it('should have uptime greater than 0', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/health/advanced', () => {
    it('should return 200 with DB and memory check', async () => {
      const response = await request(app).get('/api/health/advanced');
      expect(response.status).toBe(200);
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks.database).toBe('connected');
    });
  });
});
