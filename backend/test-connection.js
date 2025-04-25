const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mlm_user:mlms-pass-123@mymlmproject.vfknhg6.mongodb.net/mlms?retryWrites=true&w=majority&appName=mymlmproject&authSource=admin';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    console.log('Connection details:');
    console.log('- Database:', mongoose.connection.name);
    console.log('- Host:', mongoose.connection.host);
    console.log('- Port:', mongoose.connection.port);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:');
    console.error(err);
    process.exit(1);
  }); 