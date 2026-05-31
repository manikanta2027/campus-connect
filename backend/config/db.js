// Import mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB connection string from .env file
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect';

    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.log('❌ MongoDB Connection Error: ' + error.message);
    process.exit(1);
  }
};

// Function to disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.log('❌ Error: ' + error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};

