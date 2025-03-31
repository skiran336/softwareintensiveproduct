const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    supabaseUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    metadata: { type: Object },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);