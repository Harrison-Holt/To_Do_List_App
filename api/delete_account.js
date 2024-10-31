import pool from '../db.js'; 

export default async function handler(req, res) {

    if(req.method !== 'DELETE') {
      res.status(405).json({ message: 'Only DELETE Method Allowed'}); 
      return; 
    }

    const { user_id } = req.body; 

    if(!user_id) {
      res.status(400).json({ message: 'User ID Required!'}); 
    }

    try {
      const result = await pool.query(
        'DELETE FROM accounts WHERE id = $1', 
        [user_id]
      ); 

      if(result.rowCount === 0) {
        res.status(404).json({ message: 'No User Found!'}); 
        return; 
      }

      res.status(200).json({ message: 'User Deleted!'}); 
    } catch(error) {
      console.error('Error occurred during request processing: ', error); 
      res.status(500).json({ message: 'Internal Server Error!'}); 
    }
}