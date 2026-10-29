const mongoose = require('mongoose');

/**
 * Connect to MongoDB database with graceful error handling
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/customer_sentiment_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Server will continue running. Check your MongoDB Atlas Network IP whitelist or MONGO_URI.');
  }

  mongoose.connection.on('error', (err) => {
    console.error(`⚠️ MongoDB Runtime Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
  });
};

module.exports = connectDB;
