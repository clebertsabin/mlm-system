import React, { useState } from 'react';

const UserManagement = () => {
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'lecturer',
        department: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => {
            const updatedUser = { ...prev, [name]: value };
            // Clear department if role is campus_admin
            if (name === 'role' && value === 'campus_admin') {
                updatedUser.department = '';
            }
            return updatedUser;
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            
            {/* Add New User Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={newUser.firstName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={newUser.lastName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={newUser.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={newUser.password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={newUser.role}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        >
                            <option value="lecturer">Lecturer</option>
                            <option value="hod">Head of Department</option>
                            <option value="campus_admin">Campus Admin</option>
                        </select>
                    </div>
                    {newUser.role !== 'campus_admin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={newUser.department}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required={newUser.role !== 'campus_admin'}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add User
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Existing Users</h2>
                {loading ? (
                    <p>Loading users...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="space-y-4">
                        {users.map(user => (
                            <div key={user._id} className="border p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                                        <p className="text-gray-600">{user.email}</p>
                                        <p className="text-gray-600">Role: {user.role}</p>
                                        {user.department && <p className="text-gray-600">Department: {user.department}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement; 