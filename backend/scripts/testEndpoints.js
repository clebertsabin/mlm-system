const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER = {
    email: process.env.TEST_EMAIL || 'test@example.com',
    password: process.env.TEST_PASSWORD || 'test123'
};

// Test results storage
const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
        baseUrl: BASE_URL,
        nodeEnv: process.env.NODE_ENV
    },
    results: []
};

// Helper function to log results
function logResult(endpoint, status, message, response = null) {
    const result = {
        endpoint,
        status,
        message,
        timestamp: new Date().toISOString()
    };
    if (response) {
        result.response = response;
    }
    testResults.results.push(result);
    console.log(`[${status}] ${endpoint}: ${message}`);
}

// Test health endpoint
async function testHealth() {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.status === 200 && response.data.message === 'OK') {
            logResult('/health', 'PASS', 'Health check successful', response.data);
        } else {
            logResult('/health', 'FAIL', 'Health check failed', response.data);
        }
    } catch (error) {
        logResult('/health', 'ERROR', error.message);
    }
}

// Test authentication endpoints
async function testAuth() {
    try {
        // Test login
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
            logResult('/api/auth/login', 'PASS', 'Login successful');
            const token = loginResponse.data.token;
            
            // Test token verification
            try {
                const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                logResult('/api/auth/verify', 'PASS', 'Token verification successful');
            } catch (error) {
                logResult('/api/auth/verify', 'ERROR', error.message);
            }
        } else {
            logResult('/api/auth/login', 'FAIL', 'Login failed', loginResponse.data);
        }
    } catch (error) {
        logResult('/api/auth/login', 'ERROR', error.message);
    }
}

// Test user endpoints
async function testUserEndpoints(token) {
    if (!token) return;
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // Test get user profile
        const profileResponse = await axios.get(`${BASE_URL}/api/profile`, { headers });
        logResult('/api/profile', 'PASS', 'Profile retrieval successful');
        
        // Test update profile
        const updateResponse = await axios.patch(`${BASE_URL}/api/profile`, {
            firstName: 'Test',
            lastName: 'User'
        }, { headers });
        logResult('/api/profile (PATCH)', 'PASS', 'Profile update successful');
    } catch (error) {
        logResult('/api/profile', 'ERROR', error.message);
    }
}

// Test leave endpoints
async function testLeaveEndpoints(token) {
    if (!token) return;
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // Test get leave requests
        const response = await axios.get(`${BASE_URL}/api/leave`, { headers });
        logResult('/api/leave', 'PASS', 'Leave requests retrieval successful');
    } catch (error) {
        logResult('/api/leave', 'ERROR', error.message);
    }
}

// Main test function
async function runTests() {
    console.log('Starting API endpoint tests...');
    console.log(`Base URL: ${BASE_URL}`);
    
    await testHealth();
    const authResult = await testAuth();
    
    if (authResult && authResult.token) {
        await testUserEndpoints(authResult.token);
        await testLeaveEndpoints(authResult.token);
    }
    
    // Save results to file
    const resultsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const resultsFile = path.join(resultsDir, `test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    
    console.log(`\nTest results saved to: ${resultsFile}`);
    
    // Print summary
    const summary = {
        total: testResults.results.length,
        pass: testResults.results.filter(r => r.status === 'PASS').length,
        fail: testResults.results.filter(r => r.status === 'FAIL').length,
        error: testResults.results.filter(r => r.status === 'ERROR').length
    };
    
    console.log('\nTest Summary:');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.pass}`);
    console.log(`Failed: ${summary.fail}`);
    console.log(`Errors: ${summary.error}`);
    
    process.exit(summary.fail + summary.error > 0 ? 1 : 0);
}

runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
}); 