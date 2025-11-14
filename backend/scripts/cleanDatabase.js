import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Event from '../models/Event.js';
import SupportCircle from '../models/SupportCircle.js';
import Report from '../models/Report.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const cleanDatabase = async () => {
  try {
    await connectDB();

    console.log('\n🧹 Starting database cleanup...\n');

    // Count documents before deletion
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const supportCircleCount = await SupportCircle.countDocuments();
    const reportCount = await Report.countDocuments();

    console.log(`📊 Current database stats:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Support Circles: ${supportCircleCount}`);
    console.log(`   Reports: ${reportCount}`);
    console.log();

    // Delete all documents
    const userResult = await User.deleteMany({});
    const eventResult = await Event.deleteMany({});
    const supportCircleResult = await SupportCircle.deleteMany({});
    const reportResult = await Report.deleteMany({});

    console.log(`✅ Cleanup complete!`);
    console.log(`   Deleted ${userResult.deletedCount} users`);
    console.log(`   Deleted ${eventResult.deletedCount} events`);
    console.log(`   Deleted ${supportCircleResult.deletedCount} support circles`);
    console.log(`   Deleted ${reportResult.deletedCount} reports`);
    console.log();

    // Verify deletion
    const remainingUsers = await User.countDocuments();
    const remainingEvents = await Event.countDocuments();
    const remainingCircles = await SupportCircle.countDocuments();
    const remainingReports = await Report.countDocuments();

    console.log(`📊 Remaining documents:`);
    console.log(`   Users: ${remainingUsers}`);
    console.log(`   Events: ${remainingEvents}`);
    console.log(`   Support Circles: ${remainingCircles}`);
    console.log(`   Reports: ${remainingReports}`);
    console.log();

    if (remainingUsers === 0 && remainingEvents === 0 && remainingCircles === 0 && remainingReports === 0) {
      console.log('✨ Database is now clean and ready for fresh data!');
    } else {
      console.log('⚠️  Some documents may still remain.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

// Run cleanup
cleanDatabase();

