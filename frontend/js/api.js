// API URL configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : 'https://mlms-backend.onrender.com/api';

const api = {
  auth: {
    async login(credentials) {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },

    async signup(userData) {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
      
      return response.json();
    },

    async forgotPassword(email) {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }
      
      return response.json();
    }
  },

  leave: {
    async getLeaves() {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leave`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch leaves');
      }
      
      return response.json();
    },

    async getMyLeaves() {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leave/my-leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch leaves');
      }
      
      return response.json();
    },

    async createLeave(leaveData) {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(leaveData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create leave request');
      }
      
      return response.json();
    },

    async updateLeaveStatus(leaveId, status) {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leave/${leaveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update leave status');
      }
      
      return response.json();
    }
  }
};