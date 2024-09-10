import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 

dotenv.config();

export function verify_token(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ensure token extraction is correct

    if (!token) {
        return res.status(401).json({ message: 'Access token required!' });
    }

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }

        // Attach user information to the request for use in other routes
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
}
