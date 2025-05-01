const axios = require('axios');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MONITOR_INTERVAL = process.env.MONITOR_INTERVAL || 300000; // 5 minutes
const LOG_DIR = path.join(__dirname, '../logs');

// Setup logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: path.join(LOG_DIR, 'monitoring.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.Console()
    ]
});

// Endpoints to monitor
const endpoints = [
    { path: '/health', method: 'GET', auth: false },
    { path: '/api/auth/login', method: 'POST', auth: false },
    { path: '/api/profile', method: 'GET', auth: true },
    { path: '/api/leave', method: 'GET', auth: true }
];

// Performance metrics
const metrics = {
    uptime: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastCheck: new Date().toISOString()
};

// Monitor endpoint
async function monitorEndpoint(endpoint) {
    const startTime = Date.now();
    try {
        const config = {
            method: endpoint.method,
            url: `${BASE_URL}${endpoint.path}`,
            timeout: 5000
        };

        if (endpoint.auth) {
            // Add authentication token if needed
            config.headers = {
                Authorization: `Bearer ${process.env.MONITOR_TOKEN}`
            };
        }

        const response = await axios(config);
        const responseTime = Date.now() - startTime;

        metrics.totalRequests++;
        metrics.successfulRequests++;
        metrics.averageResponseTime = (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;

        logger.info('Endpoint check successful', {
            endpoint: endpoint.path,
            method: endpoint.method,
            status: response.status,
            responseTime,
            timestamp: new Date().toISOString()
        });

        return {
            status: 'success',
            responseTime,
            statusCode: response.status
        };
    } catch (error) {
        metrics.totalRequests++;
        metrics.failedRequests++;

        logger.error('Endpoint check failed', {
            endpoint: endpoint.path,
            method: endpoint.method,
            error: error.message,
            timestamp: new Date().toISOString()
        });

        return {
            status: 'error',
            error: error.message
        };
    }
}

// Save metrics to file
function saveMetrics() {
    const metricsFile = path.join(LOG_DIR, 'metrics.json');
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
}

// Main monitoring function
async function startMonitoring() {
    logger.info('Starting endpoint monitoring', {
        baseUrl: BASE_URL,
        interval: MONITOR_INTERVAL
    });

    setInterval(async () => {
        const results = await Promise.all(endpoints.map(monitorEndpoint));
        metrics.lastCheck = new Date().toISOString();
        saveMetrics();

        // Log summary
        logger.info('Monitoring cycle completed', {
            timestamp: new Date().toISOString(),
            totalEndpoints: endpoints.length,
            successfulChecks: results.filter(r => r.status === 'success').length,
            failedChecks: results.filter(r => r.status === 'error').length,
            averageResponseTime: metrics.averageResponseTime
        });
    }, MONITOR_INTERVAL);
}

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Start monitoring
startMonitoring().catch(error => {
    logger.error('Monitoring failed to start', { error: error.message });
    process.exit(1);
}); 