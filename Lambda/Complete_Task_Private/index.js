import mysql2 from 'mysql2'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const db_config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
}

export const handker = async (event) => {

    let connection; 

    try {

        const { task_id, user_id } = event; 

        connection = await mysql2.createConnection(db_config); 

        const complete_sql = `UPDATE tasks
        SET task_completed = TRUE 
        WHERE task_id = ? AND user_id = ?`; 

       const [result] = await connection.execute(complete_sql, [task_id, user_id]); 

       return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Task marked as complete!', affectedRows: result.affectedRows})
       }
    } catch(error) {
        console.error('Error marking task completed!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Error marking task completed!', error: error.message})
        }
    }
}