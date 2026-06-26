const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Route for user signup: http://localhost:5000/api/auth/register
router.post('/register', register);

// Route for user login: http://localhost:5000/api/auth/login
router.post('/login', login);

module.exports = router;