/**
 * Create admin user script
 * Usage: node scripts/create-admin.js
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import config from '../config/config.js';
import User from '../models/User.model.js';

async function createAdmin() {
  try {
    await mongoose.connect(config.mongoUri, config.mongoOptions);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log(`⚠️  Superadmin already exists: ${existing.username} (${existing.email})`);
      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@greencore-aurea.com',
      password: 'Admin@2024!',
      role: 'superadmin',
      provider: 'local',
      isActive: true,
    });

    console.log('✅ Superadmin created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: Admin@2024!`);
    console.log(`   ⚠️  Change password immediately!`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
