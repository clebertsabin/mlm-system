// Utility functions for the frontend

// Show notification
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get status badge class
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'badge-warning';
    case 'hod_approved':
    case 'campus_approved':
    case 'finance_approved':
      return 'badge-success';
    case 'hod_rejected':
    case 'campus_rejected':
    case 'finance_rejected':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

// Get status text
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'hod_approved':
      return 'HOD Approved';
    case 'hod_rejected':
      return 'HOD Rejected';
    case 'campus_approved':
      return 'Campus Admin Approved';
    case 'campus_rejected':
      return 'Campus Admin Rejected';
    case 'finance_approved':
      return 'Finance Approved';
    case 'finance_rejected':
      return 'Finance Rejected';
    default:
      return status;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return token && user;
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Redirect if not authenticated
const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/loginmlms.html';
  }
};

// Redirect if not authorized
const requireRole = (roles) => {
  const user = getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    window.location.href = '/loginmlms.html';
  }
};

// Signature handling
const setupSignaturePad = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    penColor: 'rgb(0, 0, 0)'
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear();
  });

  return signaturePad;
};

// Convert signature to base64
const getSignatureData = (signaturePad) => {
  if (!signaturePad || signaturePad.isEmpty()) {
    return null;
  }
  return signaturePad.toDataURL();
};

// Clear signature
const clearSignature = (signaturePad) => {
  if (signaturePad) {
    signaturePad.clear();
  }
};

// Handle file upload for stamp
const handleStampUpload = (fileInput) => {
  return new Promise((resolve, reject) => {
    const file = fileInput.files[0];
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

// Export utilities
window.utils = {
  showNotification,
  formatDate,
  getStatusClass,
  getStatusText,
  isAuthenticated,
  getCurrentUser,
  requireAuth,
  requireRole,
  setupSignaturePad,
  getSignatureData,
  clearSignature,
  handleStampUpload
}; 