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

        const { user_id, task_name, task_date, task_time, task_priority } = event;

        if (!user_id || !task_name || !task_date || !task_time || !task_priority) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "All fields (user_id, task_name, task_date, task_time, task_priority) are required!" })
            };
        }

        connection = await mysql2.createConnection(db_config);

        // Check if user exists
        const checkUserSQL = `SELECT COUNT(*) AS count FROM accounts WHERE user_id = ?`;
        const [userCheckResult] = await connection.execute(checkUserSQL, [user_id]);
        const userExists = userCheckResult[0].count > 0;

        if (!userExists) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User ID does not exist!" })
            };
        }

        // Insert new task
        const insertSQL = `
            INSERT INTO tasks (user_id, task_name, task_date, task_time, task_priority)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(insertSQL, [user_id, task_name, task_date, task_time, task_priority]);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Task created successfully!",
                task_id: result.insertId
            })
        };

    } catch (error) {
        console.error("Error creating task:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to create task!", error: error.message })
        };
    } finally {
        if (connection) await connection.end();
    }
};
