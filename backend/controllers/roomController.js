const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
    try {
        // Generate a random 6-character uppercase room code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Save this new room to MongoDB
        const newRoom = new Room({
            roomId: roomCode,
            status: 'waiting'
        });

        await newRoom.save();

        res.status(201).json({ message: "Room created successfully!", roomId: roomCode });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error creating room." });
    }
};