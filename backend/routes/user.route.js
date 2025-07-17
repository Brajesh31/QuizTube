import express from 'express';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../helpers/authenticatejwt.js';

const userRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // use env in prod

userRouter.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        const existingUser = await User.findOne({ name: username });

        if (existingUser) {
            if (existingUser.password !== password) {
                return res.status(401).json({ message: "Incorrect password or User with same name already exist" });
            }

            const token = jwt.sign({ id: existingUser._id, name: existingUser.name }, JWT_SECRET, {
                expiresIn: '7d',
            });

            return res.status(200).json({ message: "Logged in successfully", token });
        } else {
            const newUser = new User({ name: username, password: password });
            await newUser.save();

            const token = jwt.sign({ id: newUser._id, name: newUser.name }, JWT_SECRET, {
                expiresIn: '7d',
            });

            return res.status(201).json({ message: "User registered and logged in", token });
        }

    } catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// New endpoint to get leaderboard data
userRouter.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        // Get top 10 users ordered by score
        const topUsers = await User.find({}, 'name score totalTestCount')
            .sort({ score: -1 })
            .limit(10);

        // Get current user's data and rank
        const currentUser = await User.findById(req.user.id);
        const userRank = await User.countDocuments({ score: { $gt: currentUser.score } }) + 1;

        res.json({
            topUsers,
            currentUser: {
                ...currentUser.toObject(),
                rank: userRank
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard data' });
    }
});

export { userRouter };
