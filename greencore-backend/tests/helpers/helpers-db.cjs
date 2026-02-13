// tests/helpers/db.cjs
const mongoose = require('mongoose');

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greencore-test';

async function setupTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  await mongoose.connect(TEST_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
}

async function clearTestDB() {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
};
