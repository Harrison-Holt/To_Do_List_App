import mysql2 from 'mysql2/promise'; 
import dotenv from 'dotenv'; 

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

        const { task_id, user_id } = event; 

        connection = await mysql2.createConnection(db_config); 

        const checkUserSQL = `SELECT COUNT(*) AS count FROM accounts WHERE user_id = ?`;
        const [userCheckResult] = await connection.execute(checkUserSQL, [user_id]);
        const userExists = userCheckResult[0].count > 0;

        if (!userExists) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User ID does not exist!" })
            };
        }

        const checkTaskSQL = `SELECT COUNT(*) AS count FROM tasks WHERE task_id = ? AND user_id = ?`;
        const [taskCheckResult] = await connection.execute(checkTaskSQL, [task_id, user_id]);
        const taskExists = taskCheckResult[0].count > 0;

        if (!taskExists) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Task ID does not exist or does not belong to the user!" })
            };
        }
        
        const complete_sql = `UPDATE tasks
        SET task_completed = 1 
        WHERE task_id = ? AND user_id = ?`; 

       const [result] = await connection.execute(complete_sql, [task_id, user_id]); 

       await connection.end();
       
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