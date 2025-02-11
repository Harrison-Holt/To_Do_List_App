import dotenv from 'dotenv'; 
import mysql2 from 'mysql2/promise'; 

dotenv.config(); 

const db_config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
}

export const handler = async (event) => {

    let connection; 

    try {
        const { user_id } = event; 

        connect = await mysql2.createConnection(db_config); 

        const delete_sql = `DELETE FROM accounts 
        user_id = ?`; 

        const result = await connection.execute(delete_sql, [user_id]); 

        if(result.affectedRows === 0) {
            return {
                statusCode: 404, 
                bosy: JSON.stringify({ message: 'User not found!'})
            }
        }

        return {
            statusCode: 200, 
            body: JSON.stringify({ message: 'Successfully deleted user!'})
        }
    } catch(error) {
        console.error('Failed deleting user!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Failed deleting user!'})
        }
    }
}