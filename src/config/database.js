const mongoose = require('mongoose');

// Use environment variable if available, otherwise use hardcoded
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;