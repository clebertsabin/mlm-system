const https = require('https');
const fs = require('fs');

const BACKEND_URL = process.env.BACKEND_URL || 'https://mlms-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mlms-frontend.onrender.com';
const LOG_FILE = 'monitoring.log';

function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    console.log(logEntry.trim());
    fs.appendFileSync(LOG_FILE, logEntry);
}

function checkService(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function monitorServices() {
    logMessage('Starting health check...');

    try {
        // Check backend health
        const backendHealth = await checkService(`${BACKEND_URL}/health`);
        if (backendHealth.status === 200) {
            const healthData = JSON.parse(backendHealth.data);
            logMessage('Backend Status: OK');
            logMessage(`Database: ${healthData.services.database}`);
            logMessage(`Uploads: ${healthData.services.uploads}`);
            logMessage(`PDFs: ${healthData.services.pdfs}`);
        } else {
            logMessage(`Backend Status: ERROR (${backendHealth.status})`);
        }

        // Check frontend availability
        const frontendHealth = await checkService(FRONTEND_URL);
        if (frontendHealth.status === 200) {
            logMessage('Frontend Status: OK');
        } else {
            logMessage(`Frontend Status: ERROR (${frontendHealth.status})`);
        }
    } catch (error) {
        logMessage(`Error during health check: ${error.message}`);
    }

    logMessage('Health check completed\n');
}

// Run initial check
monitorServices();

// Schedule checks every 5 minutes
setInterval(monitorServices, 5 * 60 * 1000); 