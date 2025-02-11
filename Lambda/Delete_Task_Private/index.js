import dotenv from 'dotenv'; 
import mysql2 from 'mysql2/promise'; 

const db_config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
}

export const handler = async (event) => {

    let connection; 

    try {
        const { task_id, user_id } = event; 

        connect = await mysql2.createConnection(db_config); 

        const delete_sql = `DELETE FROM tasks 
        WHERE task_id = ? AND user_id = ?`; 

        await connection.execute(delete_sql, [task_id, user_id]); 

        return {
            statusCode: 200, 
            body: JSON.stringify({ message: 'Successfully deleted task!'})
        }
    } catch(error) {
        console.error('Failed deleting task!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Failed deleting task!'})
        }
    }
}