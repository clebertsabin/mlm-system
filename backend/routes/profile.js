const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user._id);
    const userProfile = await User.findById(req.user._id).select('-password');
    if (!userProfile) {
      console.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ 
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    console.log('Profile fetched successfully for user:', req.user._id);
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update user profile
router.patch('/', auth, async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user._id);
    const { firstName, lastName, department, profilePicture } = req.body;
    const userToUpdate = await User.findById(req.user._id);
    
    if (!userToUpdate) {
      console.error('User not found for update:', req.user._id);
      return res.status(404).json({ 
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    if (firstName) userToUpdate.firstName = firstName;
    if (lastName) userToUpdate.lastName = lastName;
    if (department) userToUpdate.department = department;
    if (profilePicture) userToUpdate.profilePicture = profilePicture;

    await userToUpdate.save();
    console.log('Profile updated successfully for user:', req.user._id);
    res.json(userToUpdate);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    console.log('Changing password for user:', req.user._id);
    const { currentPassword, newPassword } = req.body;
    const userForPasswordChange = await User.findById(req.user._id);
    
    if (!userForPasswordChange) {
      console.error('User not found for password change:', req.user._id);
      return res.status(404).json({ 
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const isMatch = await userForPasswordChange.comparePassword(currentPassword);
    if (!isMatch) {
      console.warn('Invalid current password for user:', req.user._id);
      return res.status(400).json({ 
        message: 'Current password is incorrect',
        timestamp: new Date().toISOString()
      });
    }

    userForPasswordChange.password = newPassword;
    await userForPasswordChange.save();
    console.log('Password changed successfully for user:', req.user._id);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 