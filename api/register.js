import pool from '../db.js'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests are allowed' }); 
        return; 
    }

    const { username, password, email } = req.body; 

    if (!username || !password || !email) {
        res.status(400).json({ message: 'Username, password, and email are required!' }); 
        return; 
    }

    try {
        const hashed_password = await bcrypt.hash(password, 10); 

        const result = await pool.query(
            'INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3) RETURNING *', 
            [username, hashed_password, email]
        ); 

        const user = result.rows[0]; 

        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        ); 

        res.status(201).json({ message: 'Account created successfully', token, account: { username: user.username, email: user.email } });
    } catch (error) {
        console.error('Error occurred during request processing: ', error);

        // Handle specific error scenarios
        if (error.code === '23505') {  // PostgreSQL unique violation error code
            res.status(409).json({ message: 'Username or email already exists' });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message }); 
        }
    }
}
