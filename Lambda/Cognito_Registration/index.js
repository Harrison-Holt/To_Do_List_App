import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db_config = {
    host: process.env.RDS_PROXY_ENDPOINT,  // ✅ Secure RDS Proxy Endpoint
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

export const handler = async (event) => {
    let connection;

    try {
        console.log("📌 Received Event:", JSON.stringify(event, null, 2));
        const { action, username, email } = event;

        if (action === 'storeUser') {
            console.log("📌 Connecting to MySQL RDS Proxy...");
            connection = await mysql2.createConnection(db_config);
            console.log("✅ Successfully connected to MySQL via RDS Proxy.");

            const insert_sql = `INSERT INTO accounts (username, email) VALUES (?, ?);`;
            console.log("📌 Executing SQL:", insert_sql, "with values:", username, email);
            await connection.execute(insert_sql, [username, email]);

            await connection.end();
            console.log("✅ Database connection closed.");

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "User stored in database!" })
            };
        } else {
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid Action." }) };
        }

    } catch (error) {
        console.error("❌ Error Connecting to MySQL via RDS Proxy:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error Connecting to Database", error: error.message })
        };
    }
};
