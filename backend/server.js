const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leaveRoutes = require('./routes/leave');
const profileRoutes = require('./routes/profile');
const lecturerRoutes = require('./routes/lecturers');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/lecturers', lecturerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    version: '1.1.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  };
  res.json(healthcheck);
});

// Logs endpoint
app.get('/logs', (req, res) => {
    const { search, level } = req.query;
    try {
        let logs = [];
        if (fs.existsSync('monitoring.log')) {
            const logContent = fs.readFileSync('monitoring.log', 'utf8');
            logs = logContent.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [timestamp, message] = line.split(' - ');
                    return {
                        timestamp: new Date(timestamp).getTime(),
                        message: message.trim(),
                        level: message.toLowerCase().includes('error') ? 'error' :
                               message.toLowerCase().includes('warning') ? 'warning' : 'info'
                    };
                })
                .filter(log => {
                    if (level && level !== 'all' && log.level !== level) return false;
                    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
                    return true;
                });
        }
        res.json(logs);
    } catch (error) {
        console.error('Error reading logs:', error);
        res.status(500).json({ message: 'Error reading logs' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 