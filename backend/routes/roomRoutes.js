const express = require('express');
const router = express.Router();
const { createRoom } = require('../controllers/roomController');
const auth = require('../middleware/auth'); // Brought the bouncer in

// Route to create a room: http://localhost:5000/api/rooms/create
// We placed the 'auth' middleware BEFORE the 'createRoom' controller
router.post('/create', auth, createRoom);

module.exports = router;