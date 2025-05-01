const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiConfig = {
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
    withCredentials: true
};

export const endpoints = {
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        verify: '/api/auth/verify',
        logout: '/api/auth/logout'
    },
    profile: {
        get: '/api/profile',
        update: '/api/profile',
        changePassword: '/api/profile/change-password'
    },
    leave: {
        list: '/api/leave',
        create: '/api/leave',
        update: '/api/leave/:id',
        delete: '/api/leave/:id'
    },
    users: {
        list: '/api/users',
        create: '/api/users',
        update: '/api/users/:id',
        delete: '/api/users/:id'
    }
};

export const getAuthHeader = (token) => ({
    Authorization: `Bearer ${token}`
}); 