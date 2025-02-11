import dotenv from 'dotenv';
import { response } from 'express';
import mysql2 from 'mysql2/promise'; 

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

        // Connect to MySQL
        connection = await mysql2.createConnection(db_config);

        // ✅ Insert task into the table
        const insertSQL = `
            INSERT INTO tasks (user_id, task_name, task_date, task_time, task_priority, task_completed) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(insertSQL, [user_id, task_name, task_date, task_time, task_priority, task_completed || false]);

        return {
            statusCode: 200, 
            body: JSON.stringify({ message: "Task successfully inserted into the database!", affectedRows: result.affectedRows })
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

