const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- SIGN UP LOGIC ---
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists with this email." });

        // 2. Hash (scramble) the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save the new user to MongoDB
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

// --- LOGIN LOGIC ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // 2. Check if the password matches the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

        // 3. Give the user a digital ID card (JWT Token) so they stay logged in
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error during login." });
    }
};
