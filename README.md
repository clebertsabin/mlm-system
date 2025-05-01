# MLMS (Management Leave Management System)

A comprehensive leave and mission management system with role-based access control and electronic document handling.

## Features

- User authentication (login, signup, password reset)
- Role-based access (admin, HOD, finance, lecturer)
- Leave and Mission request management
- Electronic signatures and stamps
- PDF document generation
- Profile management
- Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- PDF Generation: PDFKit
- Electronic Signatures: Signature Pad

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
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
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

5. Open the frontend files in your browser or use a local server.

## Deployment

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following environment variables:
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy the service

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
- GET `/api/leave/pdf/:id` - Download leave PDF

### Mission Management
- GET `/api/mission` - Get all missions (admin/HOD)
- GET `/api/mission/my-missions` - Get user's missions
- POST `/api/mission` - Create mission request
- PATCH `/api/mission/:id` - Update mission status
- GET `/api/mission/pdf/:id` - Download mission PDF

### Profile
- GET `/api/profile` - Get user profile
- PATCH `/api/profile` - Update profile
- POST `/api/profile/change-password` - Change password

### Document Management
- POST `/api/documents/upload` - Upload supporting documents
- GET `/api/documents/:id` - Get document
- DELETE `/api/documents/:id` - Delete document

## Role-Based Features

### Lecturer
- Submit leave and mission requests
- View request history
- Download approved PDF documents
- Update profile information

### HOD (Head of Department)
- Approve/reject requests
- Assign requests to lecturers
- View department requests
- Manage lecturer assignments

### Campus Admin
- Approve/reject requests
- Add electronic signatures
- Upload official stamps
- Generate PDF documents
- Manage all requests

### Finance
- View approved requests
- Process financial aspects
- Generate reports

## License

MIT 