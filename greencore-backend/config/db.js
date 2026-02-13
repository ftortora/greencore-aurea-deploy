import mongoose from 'mongoose';
import config from './config.js';
import logger from '../utils/logger.js';

const MAX_RETRIES = 5;

async function connectDB(retries = MAX_RETRIES) {
  try {
    const conn = await mongoose.connect(config.mongoUri, config.mongoOptions);
    logger.info(`✅ MongoDB connected: ${conn.connection.host} [${conn.connection.name}]`);
    mongoose.connection.on('error', (err) => logger.error('MongoDB error', { error: err.message }));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    return conn;
  } catch (error) {
    const attempt = MAX_RETRIES - retries + 1;
    const delay = 1000 * Math.pow(2, attempt - 1);
    logger.error(`MongoDB attempt ${attempt}/${MAX_RETRIES} failed`, { error: error.message });
    if (retries > 0) {
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
      return connectDB(retries - 1);
    }
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}

export default connectDB;
