# MockMate

🚀 Live Demo: ([https://mockmate-demo.vercel.app/](https://mock-mate-blush-eight.vercel.app/))

A comprehensive, full-stack real-time collaborative platform designed to simulate technical engineering interviews. Built using the MERN stack, Socket.IO, and WebRTC, MockMate allows interviewers and candidates to write code simultaneously, communicate via live peer-to-peer video, chat in real-time, and share resumes within a single synchronized workspace.

## Features

**Secure User Authentication:** Implements a robust authentication flow utilizing JSON Web Tokens (JWT) for stateless, secure session management. User credentials are mathematically protected using BcryptJS hashing algorithms prior to database storage, ensuring strict data privacy for interview sessions.

**Collaborative Code Editor:** A fully synchronized coding environment integrating the Monaco Editor (the engine powering VS Code). Code changes are captured and broadcasted in milliseconds via WebSockets, allowing two users to type and debug algorithms simultaneously exactly like Google Docs.

**Peer-to-Peer Video Calling:** Leverages WebRTC APIs to establish low-latency, direct video and audio streams between the interviewer and candidate. This ensures high-quality communication without routing heavy video data through the backend server.

**Persistent Live Chat:** An interactive messaging interface powered by Socket.IO for instant delivery. Chat history is permanently stored in MongoDB, ensuring that users can refresh the page or reconnect without losing their conversation context.

**Integrated Resume Viewer:** A seamless file upload pipeline utilizing Multer. Candidates can instantly upload PDF resumes, which are securely stored and rendered via an iframe directly in the workspace, allowing interviewers to toggle between the code and the resume without leaving the platform.

**Real-Time State Synchronization:** An automated event-driven architecture that manages room states. When a user uploads a resume or types a message, the backend intercepts the event and selectively broadcasts UI updates to the specific partner in that designated interview room.

## Usage

**Sign Up / Log In**
* Create an account or log in with existing credentials to generate a secure JWT session token.

**Dashboard & Room Creation**
* Generate a unique, secure 6-character room code to act as your private interview space.
* Share this code or the direct URL with your interview partner.

**Interview Workspace (The Room)**
* Write algorithms together in the C++ configured Monaco Editor.
* Communicate face-to-face using the integrated WebRTC video feed.
* Chat via the persistent text interface to share test cases or links.

**Resume Sharing**
* Click the "Choose File" button to upload a PDF resume.
* The UI will seamlessly toggle from the Code Editor to the Resume Viewer for both participants instantly.
* Use the "View Code" button to toggle back to the collaborative editor.

**Logout**
* Securely destroy the local JWT token and end your active session.

## Data Architecture & Real-World Use Cases

**The Real-Time Signaling Architecture**

MockMate solves the complex engineering challenge of maintaining bidirectional state across multiple clients using a hybrid networking approach.
* **The WebSocket Radio Tower:** Socket.IO handles lightweight, frequent data packets. Keystrokes in the Monaco Editor and text messages are sent to the Node.js backend, which acts as a central router to broadcast those changes exclusively to the target room.
* **The WebRTC Handshake:** For heavy data like video and audio, routing through Node.js would cause severe bottlenecking. Instead, the backend acts purely as a "Telephone Operator." It uses Socket.IO to pass a Session Description Protocol (SDP) "Offer" and "Answer" between the two clients. Once the clients locate each other, a direct Peer-to-Peer (P2P) tunnel is opened, and the server steps out of the way.

**Where It Can Be Used**

* **Technical Interview Simulations:** Allowing university students or bootcamp graduates to conduct realistic mock interviews with peers, combining behavioral video chat with technical code execution.
* **Remote Pair Programming:** Empowering developers to collaboratively debug algorithms or build architecture logic in real-time without needing complex IDE sharing plugins.
* **Mentorship & Tutoring:** Providing a centralized platform for senior engineers to guide junior developers, complete with the ability to review uploaded academic transcripts or resumes on the fly.

## File Structure

## System Architecture & File Structure


The application strictly separates backend API logic from frontend presentation, while consolidating complex real-time event listeners in the core server and room files for rapid prototyping.

* **mockmate/**
  * **backend/**
    * **controllers/**
      * **authController.js**: Contains the logic for user registration, authentication handling, and password hashing.
      * **roomController.js**: Manages the creation and initialization of secure interview rooms.
      * *(Note: We skipped chatController and put the logic directly in chatRoutes!)*
    * **middleware/**
      * **auth.js**: Intercepts protected routes to verify JWT tokens before allowing database or room access.
      * *(Note: We injected the upload (Multer) logic directly into server.js)*
    * **models/**
      * **User.js**: The Mongoose schema defining user credentials and security constraints.
      * **Room.js**: The Mongoose schema for storing Interviewer/Interviewee IDs and session metadata.
      * **Message.js**: The Mongoose schema that saves all room chat history.
    * **routes/**
      * **authRoutes.js**: Maps authentication endpoints (login, signup) to the user controllers.
      * **roomRoutes.js**: Defines the API endpoints for creating and joining rooms.
      * **chatRoutes.js**: Allows the React frontend to download old room messages.
    * **uploads/**: Local directory created by Node.js to store PDF resumes.
    * **.env**: Contains sensitive environment variables like JWT_SECRET and MONGO_URI.
    * **server.js**: The core Node.js entry point that powers HTTP, WebRTC signaling, Socket.IO, and Multer file interception.

  * **frontend/**
    * **src/**
      * **assets/**: Directory for images, SVGs, or font files.
      * **components/**
        * *(Note: We built the ChatBox and PdfViewer directly inside Room.jsx!)*
      * **context/**
        * **SocketContext.jsx**: The global WebSockets engine that keeps the connection alive across the app.
      * **pages/**
        * **Auth.jsx**: The user interface for signing up and logging in.
        * **Home.jsx**: Replaced the old Dashboard; uses JWT to authenticate and generate room codes.
        * **Room.jsx**: The core workspace handling the Monaco Editor, WebRTC video, and Live Chat.
      * **App.jsx**: Manages React Router setup and wraps the application in the SocketProvider.
      * **index.css**: Global resets, base styling, and Tailwind CSS directives.
    * **tailwind.config.js**: Configuration file defining custom themes, colors, and utility classes for Tailwind CSS.
    * **package.json**: Tracks frontend dependencies, now including @monaco-editor/react and socket.io-client.
## Technologies Used

**Frontend (Client)**
* **React.js:** Component-based UI development.
* **Vite:** High-performance frontend build tool and development server.
* **@monaco-editor/react:** Official VS Code engine integration for syntax highlighting and code editing.
* **WebRTC APIs:** Browser-native protocols for peer-to-peer video and audio streaming.
* **Tailwind CSS:** Utility-first CSS framework for rapid, responsive custom UI development.

**Backend (Server)**
* **Node.js:** Event-driven JavaScript runtime environment for executing server-side logic.
* **Express.js:** Robust web application framework for building the RESTful API.
* **Socket.IO:** Real-time, bidirectional, and event-based communication engine.
* **Multer:** Middleware for handling `multipart/form-data`, primarily used for uploading PDF resumes.

**Database**
* **MongoDB (Atlas):** Cloud-based NoSQL document database for scalable storage of users and chat logs.
* **Mongoose:** Object Data Modeling (ODM) library providing strict schema validation.

**Authentication & Security**
* **JSON Web Tokens (JWT):** Implementation of secure, stateless user authentication and session management.
* **BcryptJS:** Cryptographic library used for mathematically hashing user passwords prior to database insertion.
* **CORS:** Middleware enabling secure cross-origin resource sharing between the React frontend and Express backend.

**Development Tools**
* **Nodemon:** Development utility that automatically restarts the Node server upon detecting file changes.
* **Dotenv:** Environment variable management to protect sensitive backend credentials.

## Acknowledgments

Built to bring professional-grade collaboration, structural reliability, and seamless communication to the peer-to-peer technical interview process.