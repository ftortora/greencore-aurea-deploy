module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/docs/',
    '/scripts/',
    '/coverage/',
  ],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    'config/**/*.js',
  ],
  // RIMUOVI coverage threshold per ora
  setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
  testTimeout: 10000,
  verbose: true,
  bail: false,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
