const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { generateLeaveDocument } = require('../utils/pdfGenerator');

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

// Create a new leave/mission request (Lecturer)
router.post('/', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    
    const leave = new Leave({
      user: req.user._id,
      type,
      startDate,
      endDate,
      reason
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leave/mission requests for a lecturer
router.get('/my-requests', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HOD: Get all pending requests in their department
router.get('/hod/pending', auth, requireRole(['hod']), async (req, res) => {
  try {
    const lecturers = await User.find({
      department: req.user.department,
      role: 'lecturer'
    }).select('_id');

    const leaves = await Leave.find({
      user: { $in: lecturers.map(l => l._id) },
      status: 'pending'
    }).populate('user', 'firstName lastName email');
    
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HOD: Approve/Reject request
router.put('/hod/:id', auth, requireRole(['hod']), async (req, res) => {
  try {
    const { status, comment } = req.body;
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'department');

    if (!leave) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify the request belongs to a lecturer in HOD's department
    const lecturer = await User.findById(leave.user._id);
    if (lecturer.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized to approve this request' });
    }

    if (status === 'hod_approved') {
      leave.status = 'hod_approved';
      leave.hodComment = comment;
      leave.hodApprovedAt = new Date();
    } else if (status === 'hod_rejected') {
      leave.status = 'hod_rejected';
      leave.hodComment = comment;
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Campus Admin: Get all HOD-approved requests
router.get('/campus-admin/pending', auth, requireRole(['admin']), async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'hod_approved' })
      .populate('user', 'firstName lastName email department');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching HOD-approved requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Campus Admin: Approve/Reject request
router.put('/campus-admin/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, comment, signature, stamp } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (leave.status !== 'hod_approved') {
      return res.status(400).json({ message: 'Request must be HOD-approved first' });
    }

    if (status === 'campus_approved') {
      if (!signature || !stamp) {
        return res.status(400).json({ message: 'Signature and stamp are required for approval' });
      }

      // Generate document number (format: YYYY-MM-DD-XXXX)
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const documentNumber = `${year}-${month}-${day}-${randomNum}`;

      leave.status = 'campus_approved';
      leave.campusAdminComment = comment;
      leave.campusAdminApprovedAt = new Date();
      leave.campusAdminSignature = signature;
      leave.campusAdminStamp = stamp;
      leave.documentNumber = documentNumber;
    } else if (status === 'campus_rejected') {
      leave.status = 'campus_rejected';
      leave.campusAdminComment = comment;
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get official document with signature and stamp
router.get('/document/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'firstName lastName email department');

    if (!leave) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (leave.status !== 'campus_approved' && leave.status !== 'finance_approved') {
      return res.status(403).json({ message: 'Document is not officially approved' });
    }

    // Create document object with all necessary information
    const document = {
      documentNumber: leave.documentNumber,
      type: leave.type,
      user: leave.user,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      hodComment: leave.hodComment,
      campusAdminComment: leave.campusAdminComment,
      financeComment: leave.financeComment,
      hodApprovedAt: leave.hodApprovedAt,
      campusAdminApprovedAt: leave.campusAdminApprovedAt,
      financeApprovedAt: leave.financeApprovedAt,
      campusAdminSignature: leave.campusAdminSignature,
      campusAdminStamp: leave.campusAdminStamp
    };

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Finance Manager: Get all campus-approved requests
router.get('/finance/pending', auth, requireRole(['finance']), async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'campus_approved' })
      .populate('user', 'firstName lastName email department');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching campus-approved requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Finance Manager: Approve/Reject request
router.put('/finance/:id', auth, requireRole(['finance']), async (req, res) => {
  try {
    const { status, comment } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (leave.status !== 'campus_approved') {
      return res.status(400).json({ message: 'Request must be campus-approved first' });
    }

    if (status === 'finance_approved') {
      leave.status = 'finance_approved';
      leave.financeComment = comment;
      leave.financeApprovedAt = new Date();
    } else if (status === 'finance_rejected') {
      leave.status = 'finance_rejected';
      leave.financeComment = comment;
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get PDF document
router.get('/pdf/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'firstName lastName email department');

    if (!leave) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only allow access to the requester, HOD, campus admin, or finance manager
    const isAuthorized = 
      leave.user._id.toString() === req.user._id.toString() ||
      (req.user.role === 'hod' && req.user.department === leave.user.department) ||
      req.user.role === 'admin' ||
      req.user.role === 'finance';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this document' });
    }

    if (leave.status !== 'campus_approved' && leave.status !== 'finance_approved') {
      return res.status(400).json({ message: 'Document is not officially approved' });
    }

    const pdfBuffer = await generateLeaveDocument(leave, leave.user);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=leave_document_${leave.documentNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF document' });
  }
});

module.exports = router; 