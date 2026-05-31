// Script to add an admin user to the database
// Usage: node addAdmin.js

const mongoose = require('mongoose');
const User = require('./models/User');
const { hashPasswordMiddleware } = require('./middleware/passwordMiddleware');

// Get admin email from command line arguments or use default
const adminEmail = process.argv[2] || 'chitimereddimanikanta2006@gmail.com';
const adminName = process.argv[3] || 'Admin User';
const adminPassword = process.argv[4] || 'Admin@123'; // Default password - should be changed

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the MONGODB_URI from .env file
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Add admin user
const addAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`⚠️  User with email ${adminEmail} already exists`);
      
      // Update to make them admin
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log(`✅ Updated user to admin status`);
      return;
    }

    // Hash the password
    const hashedPassword = await hashPasswordMiddleware(adminPassword);

    // Create new admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      registerNumber: 'ADMIN-' + Date.now(), // Unique register number for admin
      department: 'Administration',
      year: 0, // Year 0 for admin
      isVerified: true,
      isAdmin: true,
      isMentor: false,
      skills: ['Administration', 'System Management'],
      bio: 'System Administrator'
    });

    // Save admin user to database
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Password: ${adminPassword} (Please change this immediately)`);
    console.log(`   Register Number: ${adminUser.registerNumber}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await addAdmin();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
};

main();
