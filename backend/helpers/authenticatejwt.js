import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use env in production

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("hit")

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.user = {
            id: user._id,
            name: user.name,
        };

        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ message: 'Unauthorized: Token is invalid or expired' });
    }
};
