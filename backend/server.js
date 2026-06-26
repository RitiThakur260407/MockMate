const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Added this to auto-create the uploads folder!
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const Message = require('./models/Message');
const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// --- MULTER FILE UPLOAD SETUP ---
// Safety check: Create the 'uploads' folder if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Serve the 'uploads' folder publicly so React can display the PDF
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.log('Database connection error:', err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// NEW: Upload route for the resume
app.post('/api/upload', upload.single('resume'), (req, res) => {
  res.json({ filePath: `http://localhost:5000/uploads/${req.file.filename}` });
});

// --- THE REAL-TIME RADIO TOWER ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Tell everyone else in the room that a new person arrived so they can call them!
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('send-message', async ({ roomId, message }) => {
    try {
      await Message.create({ roomId, text: message });
      socket.to(roomId).emit('receive-message', message);
    } catch (error) { console.error(error); }
  });

  socket.on('send-code', ({ roomId, code }) => {
    socket.to(roomId).emit('receive-code', code);
  });

  // NEW: When someone uploads a resume, broadcast the URL to their partner
  socket.on('send-resume', ({ roomId, resumeUrl }) => {
    socket.to(roomId).emit('receive-resume', resumeUrl);
  });

  // --- WEBRTC SIGNALING (The Telephone Operator) ---
  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });
  
  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });
  
  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', payload);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => res.send('MockMate API with Socket.IO is running!'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));