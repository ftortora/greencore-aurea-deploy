import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import config from '../config/config.js';

async function test() {
  try {
    console.log('Connecting to:', config.mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    const conn = await mongoose.connect(config.mongoUri, config.mongoOptions);
    console.log(`✅ Connected: ${conn.connection.host} [${conn.connection.name}]`);
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map((c) => c.name).join(', ') || '(none)');
    await mongoose.disconnect();
    console.log('✅ Disconnected');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}
test();
