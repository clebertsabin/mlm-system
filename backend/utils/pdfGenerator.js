const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateLeaveDocument = async (leave, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('OFFICIAL LEAVE/MISSION DOCUMENT', { align: 'center' });
      doc.moveDown();
      
      // Document Number
      doc.fontSize(12).text(`Document Number: ${leave.documentNumber}`, { align: 'right' });
      doc.moveDown(2);

      // Employee Information
      doc.fontSize(14).text('Employee Information:');
      doc.fontSize(12).text(`Name: ${user.firstName} ${user.lastName}`);
      doc.text(`Department: ${user.department}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      // Request Details
      doc.fontSize(14).text('Request Details:');
      doc.fontSize(12).text(`Type: ${leave.type.toUpperCase()}`);
      doc.text(`Start Date: ${new Date(leave.startDate).toLocaleDateString()}`);
      doc.text(`End Date: ${new Date(leave.endDate).toLocaleDateString()}`);
      doc.text(`Reason: ${leave.reason}`);
      doc.moveDown();

      // Approval Status
      doc.fontSize(14).text('Approval Status:');
      doc.fontSize(12).text('HOD Approval:');
      doc.text(`Status: ${leave.status.includes('hod_approved') ? 'APPROVED' : 'REJECTED'}`);
      doc.text(`Comment: ${leave.hodComment || 'No comment'}`);
      doc.text(`Date: ${new Date(leave.hodApprovedAt).toLocaleDateString()}`);
      doc.moveDown();

      doc.text('Campus Admin Approval:');
      doc.text(`Status: ${leave.status.includes('campus_approved') ? 'APPROVED' : 'REJECTED'}`);
      doc.text(`Comment: ${leave.campusAdminComment || 'No comment'}`);
      doc.text(`Date: ${new Date(leave.campusAdminApprovedAt).toLocaleDateString()}`);
      doc.moveDown();

      if (leave.status.includes('finance')) {
        doc.text('Finance Approval:');
        doc.text(`Status: ${leave.status.includes('finance_approved') ? 'APPROVED' : 'REJECTED'}`);
        doc.text(`Comment: ${leave.financeComment || 'No comment'}`);
        doc.text(`Date: ${new Date(leave.financeApprovedAt).toLocaleDateString()}`);
        doc.moveDown();
      }

      // Add signature and stamp if available
      if (leave.campusAdminSignature) {
        doc.moveDown();
        doc.text('Campus Admin Signature:');
        doc.image(Buffer.from(leave.campusAdminSignature, 'base64'), {
          fit: [200, 100],
          align: 'center'
        });
      }

      if (leave.campusAdminStamp) {
        doc.moveDown();
        doc.text('Official Stamp:');
        doc.image(Buffer.from(leave.campusAdminStamp, 'base64'), {
          fit: [150, 150],
          align: 'center'
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text('This is an official document. Unauthorized modifications are prohibited.', { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateLeaveDocument }; 