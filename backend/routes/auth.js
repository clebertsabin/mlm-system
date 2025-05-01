const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

// Login route
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup route (only admin can create new users)
router.post('/signup', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, firstName, lastName, department, role } = req.body;

    // Validate role
    if (!['hod', 'lecturer', 'finance', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      department,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password route
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, we'll just return the token (in production, this should be sent via email)
    res.json({ 
      message: 'Password reset instructions sent to your email',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test authentication endpoint
router.get('/test', auth, (req, res) => {
    res.json({
        message: 'Authentication successful',
        user: {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

// Test role-based access
router.get('/test/admin', auth, requireRole(['admin']), (req, res) => {
    res.json({
        message: 'Admin access granted',
        user: {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

// Test lecturer access
router.get('/test/lecturer', auth, requireRole(['lecturer']), (req, res) => {
    res.json({
        message: 'Lecturer access granted',
        user: {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

// Test student access
router.get('/test/student', auth, requireRole(['student']), (req, res) => {
    res.json({
        message: 'Student access granted',
        user: {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 