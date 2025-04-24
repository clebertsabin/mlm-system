const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');

// Get all leave requests (for admin/HOD)
router.get('/', auth, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('user', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's leave requests
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.userId })
      .populate('approvedBy', 'firstName lastName');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create leave request
router.post('/', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const leave = new Leave({
      user: req.user.userId,
      type,
      startDate,
      endDate,
      reason
    });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leave status (for admin/HOD)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    leave.status = status;
    leave.approvedBy = req.user.userId;
    await leave.save();
    
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 