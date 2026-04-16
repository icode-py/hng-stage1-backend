const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority'
    },
    port: process.env.PORT || 3000
};