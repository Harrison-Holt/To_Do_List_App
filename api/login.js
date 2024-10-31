import pool from '../db.js'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' }); 
    }

    const { username, password } = req.body;  

    // Check for missing username or password
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required!' }); 
    }

    try {
        const result = await pool.query(
            'SELECT * FROM accounts WHERE username = $1', 
            [username]
        ); 

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username! Try Again!' }); 
        }

        const user = result.rows[0]; 
        const passwordMatch = await bcrypt.compare(password, user.password); 

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password! Try Again' }); 
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1hr' }
        );

        res.status(200).json({ message: 'Login successful', token, account: { username: user.username, email: user.email } });
    } catch (error) {
        console.error('Error occurred during request processing: ', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
