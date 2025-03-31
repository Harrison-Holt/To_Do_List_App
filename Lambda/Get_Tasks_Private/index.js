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

        const { user_id } = event;

        if (!user_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Field 'user_id' is required!" })
            };
        }

        connection = await mysql2.createConnection(db_config);

        const checkUserSQL = `SELECT COUNT(*) AS count FROM accounts WHERE user_id = ?`;
        const [userCheckResult] = await connection.execute(checkUserSQL, [user_id]);
        const userExists = userCheckResult[0].count > 0;

        if (!userExists) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User ID does not exist!" })
            };
        }

        const getTasksSQL = `SELECT * FROM tasks WHERE user_id = ? ORDER BY task_date ASC, task_time ASC`;
        const [tasks] = await connection.execute(getTasksSQL, [user_id]);

        return {
            statusCode: 200,
            body: JSON.stringify({ tasks })
        };

    } catch (error) {
        console.error("Error retrieving tasks:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve tasks!", error: error.message })
        };
    } finally {
        if (connection) await connection.end();
    }
};
