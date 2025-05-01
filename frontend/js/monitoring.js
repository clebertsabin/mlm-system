// Monitoring Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check user authentication
    checkAuth();
    
    // Initialize monitoring
    initializeMonitoring();
    
    // Set up event listeners
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set user name if available
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }
}

function initializeMonitoring() {
    // Start periodic health checks
    checkHealth();
    setInterval(checkHealth, 30000); // Check every 30 seconds
    
    // Load initial logs
    loadLogs();
}

function setupEventListeners() {
    // Log search functionality
    const logSearch = document.getElementById('logSearch');
    logSearch.addEventListener('input', debounce(() => {
        loadLogs(logSearch.value);
    }, 300));
    
    // Log level filter
    const logLevel = document.getElementById('logLevel');
    logLevel.addEventListener('change', () => {
        loadLogs(logSearch.value, logLevel.value);
    });
}

// Add Chart.js for performance metrics
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
script.onload = initializeCharts;
document.head.appendChild(script);

let performanceChart;

function initializeCharts() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response Time (ms)',
                data: [],
                borderColor: '#2196F3',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function checkHealth() {
    const startTime = performance.now();
    try {
        // Check backend health
        const backendResponse = await fetch(`${API_URL}/health`);
        const backendData = await backendResponse.json();
        
        updateBackendStatus(backendData);
        
        // Check frontend status
        const frontendResponse = await fetch(FRONTEND_URL);
        updateFrontendStatus(frontendResponse.ok);
        
        // Update performance metrics
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        updatePerformanceMetrics(responseTime);
        
        // Update last check time
        document.getElementById('lastCheck').textContent = new Date().toLocaleTimeString();
        document.getElementById('pageLoadTime').textContent = `${responseTime.toFixed(2)}ms`;
    } catch (error) {
        console.error('Health check failed:', error);
        showNotification('Error checking system health', 'error');
    }
}

function updatePerformanceMetrics(responseTime) {
    if (!performanceChart) return;
    
    const now = new Date().toLocaleTimeString();
    const data = performanceChart.data;
    
    data.labels.push(now);
    data.datasets[0].data.push(responseTime);
    
    // Keep only last 10 data points
    if (data.labels.length > 10) {
        data.labels.shift();
        data.datasets[0].data.shift();
    }
    
    performanceChart.update();
}

function updateBackendStatus(data) {
    const backendIndicator = document.getElementById('backendIndicator');
    const dbStatus = document.getElementById('dbStatus');
    const uploadStatus = document.getElementById('uploadStatus');
    const pdfStatus = document.getElementById('pdfStatus');
    const uptime = document.getElementById('uptime');
    
    // Update status indicator
    if (data.message === 'OK') {
        backendIndicator.className = 'status-indicator healthy';
    } else {
        backendIndicator.className = 'status-indicator error';
    }
    
    // Update metrics
    dbStatus.textContent = data.services.database;
    uploadStatus.textContent = data.services.uploads;
    pdfStatus.textContent = data.services.pdfs;
    
    // Format uptime
    const hours = Math.floor(data.uptime / 3600);
    const minutes = Math.floor((data.uptime % 3600) / 60);
    uptime.textContent = `${hours}h ${minutes}m`;
    
    // Update additional metrics
    document.getElementById('totalRequests').textContent = data.metrics?.totalRequests || '0';
    document.getElementById('errorRate').textContent = data.metrics?.errorRate || '0%';
    
    // Update recent issues
    updateRecentIssues(data.metrics?.recentIssues || []);
}

function updateFrontendStatus(isHealthy) {
    const frontendIndicator = document.getElementById('frontendIndicator');
    const frontendValue = document.getElementById('frontendValue');
    
    if (isHealthy) {
        frontendIndicator.className = 'status-indicator healthy';
        frontendValue.textContent = 'Online';
    } else {
        frontendIndicator.className = 'status-indicator error';
        frontendValue.textContent = 'Offline';
    }
}

function updateRecentIssues(issues) {
    const issuesContent = document.getElementById('issuesContent');
    issuesContent.innerHTML = '';
    
    issues.forEach(issue => {
        const issueItem = document.createElement('div');
        issueItem.className = 'issue-item';
        
        const message = document.createElement('div');
        message.className = 'issue-message';
        message.textContent = issue.message;
        
        const time = document.createElement('div');
        time.className = 'issue-time';
        time.textContent = new Date(issue.timestamp).toLocaleString();
        
        const level = document.createElement('div');
        level.className = `issue-level ${issue.level}`;
        level.textContent = issue.level.toUpperCase();
        
        issueItem.appendChild(message);
        issueItem.appendChild(time);
        issueItem.appendChild(level);
        
        issuesContent.appendChild(issueItem);
    });
}

async function loadLogs(searchTerm = '', level = 'all') {
    try {
        const response = await fetch(`${API_URL}/logs?search=${searchTerm}&level=${level}`);
        const logs = await response.json();
        
        const logsContent = document.getElementById('logsContent');
        logsContent.innerHTML = '';
        
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.level}`;
            logEntry.textContent = `[${new Date(log.timestamp).toLocaleString()}] ${log.message}`;
            logsContent.appendChild(logEntry);
        });
    } catch (error) {
        console.error('Error loading logs:', error);
        showNotification('Error loading system logs', 'error');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
} 