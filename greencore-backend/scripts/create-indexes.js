// backend/scripts/create-indexes.js
const mongoose = require('mongoose');
require('dotenv').config();

const createIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // ═══════════════════════════════════════════════
    // ENERGY DATA INDEXES
    // ═══════════════════════════════════════════════
    console.log('\n📊 Creating indexes for energydatas collection...');

    // Main query: userId + date sorting
    await db.collection('energydatas').createIndex(
      { userId: 1, date: -1 },
      { background: true, name: 'userId_date_idx' }
    );
    console.log('✅ Index: userId + date (DESC)');

    // Aggregation: userId + source
    await db.collection('energydatas').createIndex(
      { userId: 1, source: 1 },
      { background: true, name: 'userId_source_idx' }
    );
    console.log('✅ Index: userId + source');

    // Recent entries
    await db.collection('energydatas').createIndex(
      { createdAt: -1 },
      { background: true, name: 'createdAt_idx' }
    );
    console.log('✅ Index: createdAt (DESC)');

    // Compound for advanced queries
    await db.collection('energydatas').createIndex(
      { userId: 1, date: -1, source: 1 },
      { background: true, name: 'userId_date_source_idx' }
    );
    console.log('✅ Index: userId + date + source (compound)');

    // ═══════════════════════════════════════════════
    // USER INDEXES
    // ═══════════════════════════════════════════════
    console.log('\n👤 Creating indexes for users collection...');

    // Email unique login
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true, background: true, name: 'email_unique_idx' }
    );
    console.log('✅ Index: email (UNIQUE)');

    // Username unique
    await db.collection('users').createIndex(
      { username: 1 },
      { unique: true, sparse: true, background: true, name: 'username_unique_idx' }
    );
    console.log('✅ Index: username (UNIQUE, SPARSE)');

    // OAuth Google ID
    await db.collection('users').createIndex(
      { 'oauth.googleId': 1 },
      { sparse: true, background: true, name: 'oauth_google_idx' }
    );
    console.log('✅ Index: oauth.googleId (SPARSE)');

    // OAuth GitHub ID
    await db.collection('users').createIndex(
      { 'oauth.githubId': 1 },
      { sparse: true, background: true, name: 'oauth_github_idx' }
    );
    console.log('✅ Index: oauth.githubId (SPARSE)');

    // Refresh token lookup
    await db.collection('users').createIndex(
      { refreshToken: 1 },
      { sparse: true, background: true, name: 'refreshToken_idx' }
    );
    console.log('✅ Index: refreshToken (SPARSE)');

    // ═══════════════════════════════════════════════
    // SUBSCRIBER INDEXES
    // ═══════════════════════════════════════════════
    console.log('\n📧 Creating indexes for subscribers collection...');

    // Email lookup
    await db.collection('subscribers').createIndex(
      { email: 1 },
      { unique: true, background: true, name: 'subscriber_email_idx' }
    );
    console.log('✅ Index: subscriber email (UNIQUE)');

    // Unsubscribe token
    await db.collection('subscribers').createIndex(
      { unsubscribeToken: 1 },
      { sparse: true, background: true, name: 'unsubscribe_token_idx' }
    );
    console.log('✅ Index: unsubscribeToken (SPARSE)');

    // ═══════════════════════════════════════════════
    // VERIFY INDEXES
    // ═══════════════════════════════════════════════
    console.log('\n🔍 Verifying created indexes...');

    const energyIndexes = await db.collection('energydatas').indexes();
    console.log(`\nEnergyData indexes (${energyIndexes.length}):`);
    energyIndexes.forEach(idx => console.log(`  - ${idx.name}`));

    const userIndexes = await db.collection('users').indexes();
    console.log(`\nUser indexes (${userIndexes.length}):`);
    userIndexes.forEach(idx => console.log(`  - ${idx.name}`));

    const subscriberIndexes = await db.collection('subscribers').indexes();
    console.log(`\nSubscriber indexes (${subscriberIndexes.length}):`);
    subscriberIndexes.forEach(idx => console.log(`  - ${idx.name}`));

    console.log('\n✅ All indexes created successfully!');
    console.log('💡 Run this script again anytime to ensure indexes are up to date.');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  createIndexes();
}

module.exports = createIndexes;
