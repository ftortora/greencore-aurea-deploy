// tests/setup.cjs
// Setup environment variables per test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-32-chars-minimum!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-min!!';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/greencore-test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.EMAIL_ENABLED = 'false';
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';

// Mock nodemailer globally
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((mailOptions, callback) => {
      if (callback) {
        callback(null, { messageId: 'test-message-id' });
      }
      return Promise.resolve({ messageId: 'test-message-id' });
    }),
    verify: jest.fn((callback) => {
      if (callback) callback(null, true);
      return Promise.resolve(true);
    }),
  })),
}));

// Mock axios per OAuth
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  default: {
    post: jest.fn(() => Promise.resolve({ data: {} })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock mongoose globally
jest.mock('mongoose', () => ({
  connect: jest.fn(() => Promise.resolve({
    connection: {
      host: 'localhost',
      name: 'greencore-test',
      readyState: 1,
    },
  })),
  connection: {
    readyState: 1,
    host: 'localhost',
    name: 'greencore-test',
    db: {
      admin: () => ({
        ping: jest.fn(() => Promise.resolve({ ok: 1 })),
      }),
    },
    close: jest.fn(() => Promise.resolve()),
  },
  disconnect: jest.fn(() => Promise.resolve()),
}));

// Timeout
jest.setTimeout(10000);

// Cleanup dopo tutti i test
afterAll(async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    if (typeof mongoose.connection.close === 'function') {
      await mongoose.connection.close();
    }
  }
});

// Clear mocks tra test
afterEach(() => {
  jest.clearAllMocks();
});
