const mongoose = require('mongoose');

// Hardcoded URI for testing
const MONGODB_URI = 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Don't exit process yet, let's see the error
        throw error;
    }
};

module.exports = connectDB;