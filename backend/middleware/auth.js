const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware: Checking authentication');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('Auth middleware: No token provided');
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Auth middleware: Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Auth middleware: Token decoded for user ${decoded.userId}`);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error(`Auth middleware: User ${decoded.userId} not found`);
      return res.status(401).json({ 
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Auth middleware: User ${user._id} authenticated successfully`);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      console.log(`Role check: Required roles ${roles.join(', ')}`);
      
      if (!req.user) {
        console.warn('Role check: No user found in request');
        return res.status(401).json({ 
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      if (!roles.includes(req.user.role)) {
        console.warn(`Role check: User ${req.user._id} lacks required role. Current role: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Access denied: insufficient permissions',
          requiredRoles: roles,
          currentRole: req.user.role,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`Role check: User ${req.user._id} has required role ${req.user.role}`);
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        message: 'Role verification error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
};

module.exports = { auth, requireRole }; 