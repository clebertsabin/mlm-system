import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaveService } from '../services/api';

const LeaveRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newRequest, setNewRequest] = useState({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'annual'
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await leaveService.list();
            setRequests(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await leaveService.create(newRequest);
            setNewRequest({
                startDate: '',
                endDate: '',
                reason: '',
                type: 'annual'
            });
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create leave request');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusChange = async (id, status) => {
        try {
            await leaveService.update(id, { status });
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update leave request');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h2 className="text-2xl font-bold mb-6">Leave Requests</h2>
                                
                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="mb-8">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={newRequest.startDate}
                                            onChange={handleChange}
                                            required
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={newRequest.endDate}
                                            onChange={handleChange}
                                            required
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Type
                                        </label>
                                        <select
                                            name="type"
                                            value={newRequest.type}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        >
                                            <option value="annual">Annual Leave</option>
                                            <option value="sick">Sick Leave</option>
                                            <option value="personal">Personal Leave</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Reason
                                        </label>
                                        <textarea
                                            name="reason"
                                            value={newRequest.reason}
                                            onChange={handleChange}
                                            required
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            Submit Request
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4">My Requests</h3>
                                    {requests.length === 0 ? (
                                        <p className="text-gray-600">No leave requests found</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {requests.map(request => (
                                                <div
                                                    key={request._id}
                                                    className="border rounded p-4"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">
                                                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-gray-600">{request.type}</p>
                                                            <p className="mt-2">{request.reason}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-2 py-1 rounded text-sm ${
                                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {request.status}
                                                            </span>
                                                            {user?.role === 'admin' && request.status === 'pending' && (
                                                                <div className="mt-2 space-x-2">
                                                                    <button
                                                                        onClick={() => handleStatusChange(request._id, 'approved')}
                                                                        className="bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(request._id, 'rejected')}
                                                                        className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequests; 