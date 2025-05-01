require('dotenv').config();
const metricsService = require('../utils/metricsService');

async function sendDailyReport() {
    try {
        console.log('Sending daily system report...');
        await metricsService.sendDailyReport();
        console.log('Daily report sent successfully');
    } catch (error) {
        console.error('Error sending daily report:', error);
    }
}

// Run the report
sendDailyReport(); 