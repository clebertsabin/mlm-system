const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['leave', 'mission'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'hod_approved', 'hod_rejected', 'campus_approved', 'campus_rejected', 'finance_approved', 'finance_rejected', 'completed'],
    default: 'pending'
  },
  hodComment: {
    type: String,
    default: ''
  },
  campusAdminComment: {
    type: String,
    default: ''
  },
  financeComment: {
    type: String,
    default: ''
  },
  hodApprovedAt: {
    type: Date
  },
  campusAdminApprovedAt: {
    type: Date
  },
  financeApprovedAt: {
    type: Date
  },
  // Electronic signature and stamp fields
  campusAdminSignature: {
    type: String, // Base64 encoded signature image
    default: ''
  },
  campusAdminStamp: {
    type: String, // Base64 encoded stamp image
    default: ''
  },
  documentNumber: {
    type: String, // Official document number
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leave', leaveSchema); 