# Quiz Application

A full-stack quiz application built with React and Node.js that allows administrators to create quizzes and users to take them.

## Features

- User Authentication (Login/Register)
- Role-based access (Admin/User)
- Quiz Creation and Management (Admin)
  - Create quizzes with multiple-choice questions
  - Set quiz duration and marks
  - View quiz participants and results
- Quiz Taking (User)
  - Attempt quizzes with timer
  - View results immediately
  - Track first attempt accuracy
  - Multiple attempts allowed

## Technology Stack

### Frontend
- React
- Material-UI
- React Router
- Axios for API calls

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   Create `.env` file in the server directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the application:
   ```bash
   # Start server (from server directory)
   npm start

   # Start client (from client directory)
   npm start
   ```

## Usage

### Admin
1. Login with admin credentials
2. Create new quizzes from the admin dashboard
3. View quiz results and participant statistics

### User
1. Register/Login with user credentials
2. View available quizzes on the dashboard
3. Start a quiz and answer questions within the time limit
4. View results after submission

## Notes
- Quiz options are numbered 1-4 for user convenience but stored 0-3 internally
- First attempt accuracy is tracked separately from subsequent attempts
- Timer automatically submits quiz when time expires
