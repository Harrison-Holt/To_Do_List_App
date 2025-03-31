import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

export const handler = async (event) => {
    let connection;
    try {
        console.log("🔹 Raw Event:", event);

        const { user_id, task_id, task_name, task_date, task_time, task_priority } = event; 

        if (!user_id || !task_id || !task_name || !task_date || !task_time || !task_priority) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "All fields (user_id, task_id, task_name, task_date, task_time, task_priority) are required!" })
            };
        }

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

        const updateSQL = `
            UPDATE tasks
            SET 
                task_name = ?, 
                task_date = ?, 
                task_time = ?, 
                task_priority = ?
            WHERE task_id = ? AND user_id = ?`;

        const [result] = await connection.execute(updateSQL, [task_name, task_date, task_time, task_priority, task_id, user_id]);

        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Task not found or user not authorized to update this task." })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Successfully updated task!", affectedRows: result.affectedRows })
        };

    } catch (error) {
        console.error("Error updating task:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to update task!", error: error.message })
        };
    } finally {
        if (connection) await connection.end();
    }
};
