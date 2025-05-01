const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendAlert(subject, message) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `[MLMS Alert] ${subject}`,
                html: `
                    <h2>MLMS System Alert</h2>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Message:</strong> ${message}</p>
                    <p>Please check the monitoring dashboard for more details.</p>
                `
            });
            console.log('Alert email sent successfully');
        } catch (error) {
            console.error('Error sending alert email:', error);
        }
    }

    async sendDailyReport(metrics) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: 'MLMS Daily System Report',
                html: `
                    <h2>MLMS Daily System Report</h2>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <h3>System Metrics</h3>
                    <ul>
                        <li>Uptime: ${metrics.uptime}</li>
                        <li>Database Status: ${metrics.database}</li>
                        <li>Uploads Status: ${metrics.uploads}</li>
                        <li>PDFs Status: ${metrics.pdfs}</li>
                        <li>Total Requests: ${metrics.totalRequests}</li>
                        <li>Error Rate: ${metrics.errorRate}%</li>
                    </ul>
                    <h3>Recent Issues</h3>
                    <ul>
                        ${metrics.recentIssues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                `
            });
            console.log('Daily report email sent successfully');
        } catch (error) {
            console.error('Error sending daily report email:', error);
        }
    }
}

module.exports = new EmailService(); 