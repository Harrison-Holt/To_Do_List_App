import dotenv from 'dotenv'; 
import mysql2 from 'mysql2/promise'; 

const db_config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
}

// This is a test commment updated through codebuild!

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