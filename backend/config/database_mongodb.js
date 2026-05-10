




const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};


const testConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB connection is active');
    return true;
  } else {
    console.log('❌ MongoDB connection is not active');
    return false;
  }
};

module.exports = { connectDB, testConnection };
