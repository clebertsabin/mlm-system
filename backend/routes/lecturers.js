const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Get all lecturers in HOD's department
router.get('/', auth, requireRole(['hod']), async (req, res) => {
  try {
    const lecturers = await User.find({
      role: 'lecturer',
      department: req.user.department
    }).select('-password');

    res.json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new lecturer to HOD's department
router.post('/', auth, requireRole(['hod']), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const lecturer = new User({
      email,
      password,
      firstName,
      lastName,
      department: req.user.department,
      role: 'lecturer'
    });

    await lecturer.save();

    res.status(201).json({
      message: 'Lecturer added successfully',
      lecturer: {
        id: lecturer._id,
        email: lecturer.email,
        firstName: lecturer.firstName,
        lastName: lecturer.lastName,
        department: lecturer.department
      }
    });
  } catch (error) {
    console.error('Error adding lecturer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lecturer details
router.put('/:id', auth, requireRole(['hod']), async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const lecturer = await User.findOne({
      _id: req.params.id,
      role: 'lecturer',
      department: req.user.department
    });

    if (!lecturer) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }

    lecturer.firstName = firstName || lecturer.firstName;
    lecturer.lastName = lastName || lecturer.lastName;
    await lecturer.save();

    res.json({
      message: 'Lecturer updated successfully',
      lecturer: {
        id: lecturer._id,
        email: lecturer.email,
        firstName: lecturer.firstName,
        lastName: lecturer.lastName,
        department: lecturer.department
      }
    });
  } catch (error) {
    console.error('Error updating lecturer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove lecturer from department
router.delete('/:id', auth, requireRole(['hod']), async (req, res) => {
  try {
    const lecturer = await User.findOne({
      _id: req.params.id,
      role: 'lecturer',
      department: req.user.department
    });

    if (!lecturer) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }

    await lecturer.remove();
    res.json({ message: 'Lecturer removed successfully' });
  } catch (error) {
    console.error('Error removing lecturer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 