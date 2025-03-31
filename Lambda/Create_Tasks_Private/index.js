import dotenv from 'dotenv';
import mysql2 from 'mysql2/promise';  // Use promise-based connection

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
        const { user_id, task_name, task_date, task_time, task_priority, task_completed } = event;

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

        const insertSQL = `
            INSERT INTO tasks (user_id, task_name, task_date, task_time, task_priority, task_completed) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(insertSQL, [user_id, task_name, task_date, task_time, task_priority, task_completed || false]);

        const task_id = result.insertId;

        await connection.end();

        return {
            statusCode: 200, 
            body: JSON.stringify({ 
                message: "Task successfully inserted into the database!", 
                task_id: task_id 
            })
        }; 

    } catch (error) {
        console.error("Error in Lambda function:", error);
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: "Error in Lambda function", error: error.message })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
