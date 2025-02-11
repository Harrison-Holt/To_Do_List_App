import mysql2 from 'mysql2'; 
import dotenv from 'dotenv'

dotenv.config(); 

db_config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
}

export const handler = async (event) => {

    let connection; 

    try {
    const { task_id, user_id, task_name, task_date, task_time, task_priority } = event; 

    connection = await mysql2.createConnection(db_config); 

    const update_sql = `
    UPDATE tasks
    SET 
        task_name = ?, 
        task_date = ?, 
        task_time = ?, 
        task_priority = ?
    WHERE task_id = ? AND user_id = ?`;

    const [result] = await connection.execute(update_sql, [task_id, user_id, task_name, task_date, task_time, task_priority]); 

    return {
        statusCode: 200, 
        body: JSON.stringify({ message: 'Successfully updated task!', affectedRows: result.affectedRows})
    }
    } catch(error) {
        console.error('failed to update task!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'failed to update task!', error: error.message})
        }
    }
}