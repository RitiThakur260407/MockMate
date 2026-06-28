const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    interviewer: { type: String }, // We will store the user's name here for now
    interviewee: { type: String },
    status: { type: String, default: 'waiting' } // Can be 'waiting', 'active', or 'completed'
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
