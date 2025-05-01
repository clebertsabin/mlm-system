import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LeaveRequests from './pages/LeaveRequests';
import UserManagement from './pages/UserManagement';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/leave-requests"
                        element={
                            <ProtectedRoute>
                                <LeaveRequests />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App; 