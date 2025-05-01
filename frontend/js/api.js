// API URL configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://mlms-backend.onrender.com/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const api = {
  auth: {
    async login(credentials) {
      return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    },

    async signup(userData) {
      return apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    async forgotPassword(email) {
      return apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    }
  },

  leave: {
    async getMyRequests() {
      return apiCall('/leave/my-requests');
    },

    async createRequest(requestData) {
      return apiCall('/leave', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
    },

    async getPendingRequests() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'hod') {
        return apiCall('/leave/hod/pending');
      } else if (user.role === 'admin') {
        return apiCall('/leave/campus-admin/pending');
      } else if (user.role === 'finance') {
        return apiCall('/leave/finance/pending');
      }
      throw new Error('Unauthorized');
    },

    async approveRequest(requestId, status, comment, signature = null, stamp = null) {
      const user = JSON.parse(localStorage.getItem('user'));
      let endpoint = '';
      
      if (user.role === 'hod') {
        endpoint = `/leave/hod/${requestId}`;
      } else if (user.role === 'admin') {
        endpoint = `/leave/campus-admin/${requestId}`;
      } else if (user.role === 'finance') {
        endpoint = `/leave/finance/${requestId}`;
      } else {
        throw new Error('Unauthorized');
      }

      const body = { status, comment };
      if (signature) body.signature = signature;
      if (stamp) body.stamp = stamp;

      return apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
    },

    async getDocument(requestId) {
      return apiCall(`/leave/document/${requestId}`);
    },

    async downloadPDF(requestId) {
      const response = await fetch(`${API_URL}/leave/pdf/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_document_${requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },

  lecturers: {
    async getLecturers() {
      return apiCall('/lecturers');
    },

    async addLecturer(lecturerData) {
      return apiCall('/lecturers', {
        method: 'POST',
        body: JSON.stringify(lecturerData)
      });
    },

    async updateLecturer(lecturerId, data) {
      return apiCall(`/lecturers/${lecturerId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async removeLecturer(lecturerId) {
      return apiCall(`/lecturers/${lecturerId}`, {
        method: 'DELETE'
      });
    }
  },

  profile: {
    async getProfile() {
      return apiCall('/profile');
    },

    async updateProfile(data) {
      return apiCall('/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  }
};

// Export the API object
window.api = api;