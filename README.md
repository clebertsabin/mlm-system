# MLMS (Management Leave Management System)

A comprehensive leave management system with role-based access control.

## Features

- User authentication (login, signup, password reset)
- Role-based access (admin, HOD, finance, user)
- Leave management
- Profile management
- Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/mlms.git
cd mlms
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mlms
JWT_SECRET=your-secret-key
```

4. Start the backend server:
```bash
npm start
```

5. Open the frontend files in your browser or use a local server.

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/signup` - User registration
- POST `/api/auth/forgot-password` - Password reset

### Leave Management
- GET `/api/leave` - Get all leaves (admin/HOD)
- GET `/api/leave/my-leaves` - Get user's leaves
- POST `/api/leave` - Create leave request
- PATCH `/api/leave/:id` - Update leave status

### Profile
- GET `/api/profile` - Get user profile
- PATCH `/api/profile` - Update profile
- POST `/api/profile/change-password` - Change password

## License

MIT 