# TodoComp - Task Manager App

## Overview
TodoComp is a full-stack task management application built using React Native (Expo) for the frontend and Node.js with MongoDB for the backend. It allows users to sign up, log in, and manage tasks with full CRUD functionality.

## Features
### Frontend (React Native with Expo)
- **Authentication**
  - Signup and Login screens with JWT-based authentication
  - AsyncStorage for token storage
- **Task Management**
  - Home screen displaying tasks from the backend (pull-to-refresh enabled)
  - Add Task screen to create a new task
  - Task Details screen for viewing, editing, and deleting tasks
- **Logout**
  - Clears stored token and navigates to the login screen
- **Navigation & UI**
  - React Navigation (Stack Navigator)
  - React Native Paper for UI components

### Backend (Node.js, Express, MongoDB)
- **Authentication**
  - JWT-based authentication
  - Secure password hashing using bcrypt.js
- **Task Management APIs** (Protected Routes)
  - `POST /auth/signup` → Register a new user
  - `POST /auth/login` → Authenticate user and return JWT
  - `POST /tasks` → Create a new task
  - `GET /tasks` → Get all tasks for the logged-in user
  - `GET /tasks/:id` → Get a specific task
  - `PUT /tasks/:id` → Update a task
  - `DELETE /tasks/:id` → Delete a task
- **Middleware & Security**
  - CORS enabled
  - Rate limiting for request handling

### Screenshots

### Screenshots

<img src="https://github.com/user-attachments/assets/c0b2d077-2c59-4727-807b-9881d043ede1" width="200" alt="App Screenshot 1" />
<img src="https://github.com/user-attachments/assets/30be12c4-f996-4682-b225-cb77a1b9d08e" width="200" alt="App Screenshot 2" />
<img src="https://github.com/user-attachments/assets/d17468c0-0d89-4257-997b-beb619c37c90" width="200" alt="App Screenshot 3" />
<img src="https://github.com/user-attachments/assets/e017e13c-0294-4a2f-b4e8-11db6439800e" width="200" alt="App Screenshot 4" />
<img src="https://github.com/user-attachments/assets/1169f504-ae5c-4f82-a206-4204a20d824c" width="200" alt="App Screenshot 5" />
<img src="https://github.com/user-attachments/assets/fcb620a1-bb90-414e-93d1-f392c03bca8c" width="200" alt="App Screenshot 6" />
<img src="https://github.com/user-attachments/assets/7baac4ea-4dfe-4e96-b062-ab77487786b7" width="200" alt="App Screenshot 7" />
<img src="https://github.com/user-attachments/assets/8c7e8451-da58-489a-97d6-6b0d6cffffed" width="200" alt="App Screenshot 8" />
<img src="https://github.com/user-attachments/assets/0fe90831-3124-490c-a73e-6a43ccc54f64" width="200" alt="App Screenshot 9" />
<img src="https://github.com/user-attachments/assets/b6fd3bec-d638-41df-8cb0-a89551fe9dd3" width="200" alt="App Screenshot 10" />
<img src="https://github.com/user-attachments/assets/3fb94ecc-45cd-40bd-b8ff-4eedefecd09e" width="200" alt="App Screenshot 11" />
<img src="https://github.com/user-attachments/assets/570dd2d1-2eec-42d7-8eaf-eba5e63f2bc7" width="200" alt="App Screenshot 12" />

## Tech Stack
### Frontend
- React Native (Expo)
- React Context API (State Management)
- React Navigation (Stack Navigator)
- AsyncStorage
- React Native Paper

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt.js for password hashing
- Railway for deployment

## Installation & Setup
### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/enggsatyamraj/taskcomp
   ```
2. Navigate to the backend directory:
   ```sh
   cd backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```env
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-secret-key>
   PORT=<your-port-number>
   JWT_EXPIRE=<jwt-expiration-time>
   MAIL_APP_PASSWORD=<your-mail-app-password>
   MAIL_USER=<your-mail-user>
   ```
5. Start the backend server:
   ```sh
   npm run dev
   ```
6. The backend is deployed at:
   [TodoComp Backend](https://todocompbackend-production.up.railway.app/)

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the Expo development server:
   ```sh
   expo start
   ```
4. Download the APK for testing:
   [TodoComp APK](https://expo.dev/artifacts/eas/onUCiNos5SoNj68phuD6MX.apk)

## API Documentation
The API endpoints and testing collection can be accessed via Postman:
[Postman Collection](https://sih999.postman.co/workspace/SIH-Workspace~5f34e70f-eba4-4894-a96d-12403b71538c/collection/29181681-1d28e5ad-5155-4b09-aa9d-c7111d192cbf?action=share&creator=29181681)

## Bonus Features (Optional Enhancements)
- Password reset functionality
- React Native Gesture Handler for smooth UI animations

## Contribution
Feel free to fork the repository, open issues, or submit pull requests.

## License
This project is licensed under the MIT License.

## Repository Link
[GitHub Repository](https://github.com/enggsatyamraj/taskcomp)

