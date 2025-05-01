const fs = require('fs');
const path = require('path');

// Get environment variables
const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
const pdfDir = process.env.PDF_DIR || '/tmp/pdfs';
const maxFileAge = parseInt(process.env.MAX_FILE_AGE || '86400'); // Default 24 hours

// Function to remove old files from a directory
function cleanupDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`Directory ${directory} does not exist`);
        return;
    }

    const files = fs.readdirSync(directory);
    const now = Date.now();

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        const fileAge = (now - stats.mtime.getTime()) / 1000; // Age in seconds

        if (fileAge > maxFileAge) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Deleted old file: ${filePath}`);
            } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }
    });
}

// Clean up both directories
console.log('Starting cleanup process...');
cleanupDirectory(uploadDir);
cleanupDirectory(pdfDir);
console.log('Cleanup process completed'); 