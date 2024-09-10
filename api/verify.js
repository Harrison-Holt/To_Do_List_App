import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 

dotenv.config();

export default function handler(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }
        res.status(200).json({ message: 'Token is valid', user });
    });
}
