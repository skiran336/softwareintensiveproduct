const User = require('../models/User');

exports.syncUser = async (req, res) => {
    try {
        const { supabaseUserId, email, metadata } = req.body;
        
        if (!supabaseUserId || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let user = await User.findOne({ supabaseUserId });

        if (user) {
            // Update existing user
            user.email = email;
            user.metadata = metadata;
            user.lastLogin = new Date();
        } else {
            // Create new user
            user = new User({
                supabaseUserId,
                email,
                metadata,
                createdAt: new Date(),
                lastLogin: new Date()
            });
        }

        await user.save();
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};