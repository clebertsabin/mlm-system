const https = require('https');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'https://mlms-frontend.onrender.com';
const LOGIN_PAGE_PATH = '/loginmlms.html';
const EXPECTED_TITLE = 'Login';

function verifyLoginPage() {
    return new Promise((resolve, reject) => {
        https.get(`${FRONTEND_URL}${LOGIN_PAGE_PATH}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    // Check if the page contains the expected title
                    if (data.includes(EXPECTED_TITLE)) {
                        console.log('✅ Login page verification successful');
                        console.log(`URL: ${FRONTEND_URL}${LOGIN_PAGE_PATH}`);
                        console.log(`Status Code: ${res.statusCode}`);
                        resolve(true);
                    } else {
                        console.error('❌ Login page content verification failed');
                        console.error('Expected title not found in the page');
                        resolve(false);
                    }
                } else {
                    console.error('❌ Login page verification failed');
                    console.error(`Status Code: ${res.statusCode}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.error('❌ Error verifying login page:', err.message);
            reject(err);
        });
    });
}

// Run the verification
verifyLoginPage()
    .then(success => {
        if (!success) {
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Verification failed:', err);
        process.exit(1);
    }); 