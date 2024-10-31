import pool from '../db.js'; 

export default async function handler(req, res) {

    if(req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST Method Allowed!'}); 
        return; 
    }

    const { new_email, user_id } = req.body; 

    if(!new_email || !user_id) {
        res.status(400).json({ message: 'New Email Required!'}); 
        return; 
    }

    try {
        const result = await pool.query(
            'UPDATE accounts SET email = $1 WHERE id = $2', 
            [new_email, user_id]
        ); 

        if(result.rowCount === 0) {
            res.status(404).json({ message: 'User not found in DB!'}); 
            return; 
        }

        res.status(200).json({ message: 'Email has been updated!'}); 
    } catch(error) {
        console.error('Error occurred during request processing: ', error);
        res.status(500).json({ message: 'Internal Server Error!'}); 
    }
}