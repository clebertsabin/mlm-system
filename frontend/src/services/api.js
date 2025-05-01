import axios from 'axios';
import { apiConfig, endpoints, getAuthHeader } from '../config/api';

const api = axios.create(apiConfig);

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                ...getAuthHeader(token)
            };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post(endpoints.auth.login, credentials),
    register: (userData) => api.post(endpoints.auth.register, userData),
    verify: () => api.get(endpoints.auth.verify),
    logout: () => api.post(endpoints.auth.logout)
};

export const profileService = {
    get: () => api.get(endpoints.profile.get),
    update: (data) => api.put(endpoints.profile.update, data),
    changePassword: (data) => api.post(endpoints.profile.changePassword, data)
};

export const leaveService = {
    list: () => api.get(endpoints.leave.list),
    create: (data) => api.post(endpoints.leave.create, data),
    update: (id, data) => api.put(endpoints.leave.update.replace(':id', id), data),
    delete: (id) => api.delete(endpoints.leave.delete.replace(':id', id))
};

export const userService = {
    list: () => api.get(endpoints.users.list),
    create: (data) => api.post(endpoints.users.create, data),
    update: (id, data) => api.put(endpoints.users.update.replace(':id', id), data),
    delete: (id) => api.delete(endpoints.users.delete.replace(':id', id))
}; 