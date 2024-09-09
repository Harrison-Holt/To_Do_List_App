import pool from '../db.js'; 
import bcrypt from 'bcryptjs'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests are allowed' }); 
        return; 
    }

    const { username, user_password } = req.body; 

    if (!username || !user_password) {
        res.status(400).json({ message: 'Username and password are required!' }); 
        return; 
    }

    try {

        const result = await pool.query(
            'SELECT * FROM accounts WHERE username = $1', 
            [username]
        ); 

        if(result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid username! Try Again!" }); 
        }

        const user = result.rows[0]; 

        const password_match = await bcrypt.compare(user_password, user.password); 

        if (!password_match) {
            return res.status(401).json({ message: "Invalid password! Try Again"}); 
        }

        res.status(200).json({ message: 'Account Login successfully',  account: { username: user.username } });
    } catch (error) {
        console.error('Error occurred during request processing: ', error);
        res.status(500).json({ message: 'Account Login Failed', error: error.message });

}
}
