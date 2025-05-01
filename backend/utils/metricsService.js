const fs = require('fs');
const path = require('path');
const emailService = require('./emailService');

class MetricsService {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            totalRequests: 0,
            errorCount: 0,
            recentIssues: [],
            lastAlertTime: 0
        };
        this.metricsFile = path.join(process.env.UPLOAD_DIR || '/tmp/uploads', 'metrics.json');
        this.loadMetrics();
    }

    loadMetrics() {
        try {
            if (fs.existsSync(this.metricsFile)) {
                const data = fs.readFileSync(this.metricsFile, 'utf8');
                this.metrics = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }

    saveMetrics() {
        try {
            fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
        } catch (error) {
            console.error('Error saving metrics:', error);
        }
    }

    trackRequest(isError = false) {
        this.metrics.totalRequests++;
        if (isError) {
            this.metrics.errorCount++;
        }
        this.saveMetrics();
    }

    addIssue(issue) {
        this.metrics.recentIssues.unshift(issue);
        if (this.metrics.recentIssues.length > 10) {
            this.metrics.recentIssues.pop();
        }
        this.saveMetrics();

        // Send alert if enough time has passed since last alert
        const now = Date.now();
        if (now - this.metrics.lastAlertTime > 3600000) { // 1 hour
            emailService.sendAlert('System Issue Detected', issue);
            this.metrics.lastAlertTime = now;
            this.saveMetrics();
        }
    }

    getMetrics() {
        const uptime = Math.floor((Date.now() - this.metrics.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        return {
            uptime: `${hours}h ${minutes}m`,
            totalRequests: this.metrics.totalRequests,
            errorRate: this.metrics.totalRequests > 0 
                ? ((this.metrics.errorCount / this.metrics.totalRequests) * 100).toFixed(2)
                : '0.00',
            recentIssues: this.metrics.recentIssues
        };
    }

    async sendDailyReport() {
        const metrics = this.getMetrics();
        await emailService.sendDailyReport(metrics);
    }
}

module.exports = new MetricsService(); 