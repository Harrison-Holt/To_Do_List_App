import pool from '../db.js'; 
import bcrypt from 'bcryptjs'; 

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests are allowed '}); 
        return; 
    }

    const { username, password, email } = req.body; 

    if(!username || !password || !email) {
        res.status(400).json({ message: 'username, password, and email are required!' }); 
        return; 
    }

    try {

        const hashed_password = await bcrypt.hash(password, 10); 

        const result = await pool.query(
            'INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3)', 
            [username, hashed_password, email]
        ); 

        res.status(201).json({ message: 'Account created successfully', account: result.rows[0] });
    } catch(error) {
        console.error('Error occurred during request process: ', error.message); 
          
          if (error.code === '23505') { 
            res.status(409).json({ message: 'Username or email already exists' });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message }); 
        }
    }
}