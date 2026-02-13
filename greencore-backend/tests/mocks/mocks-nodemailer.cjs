// tests/mocks/nodemailer.cjs
module.exports = {
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((mailOptions, callback) => {
      const result = {
        messageId: 'mock-message-id-' + Date.now(),
        accepted: [mailOptions.to],
        rejected: [],
        response: '250 Message accepted',
      };
      
      if (callback) {
        callback(null, result);
      }
      return Promise.resolve(result);
    }),
    verify: jest.fn((callback) => {
      if (callback) {
        callback(null, true);
      }
      return Promise.resolve(true);
    }),
  })),
};
