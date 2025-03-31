import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

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
        console.log("Incoming event:", JSON.stringify(event, null, 2));

        const { username, email, user_id } = event; // user_id = Cognito sub

        // ✅ Validate Input
        if (!username || !email || !user_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Username, email, and user_id (Cognito sub) are required!" })
            };
        }

        console.log(`🔹 Storing user ${username} (${email}) with Cognito user_id: ${user_id}`);

        // ✅ Connect to MySQL
        connection = await mysql2.createConnection(db_config);

        // ✅ Insert into accounts table (Replacing auto-generated ID with Cognito user_id)
        const insert_sql = `INSERT INTO accounts (username, email, user_id) VALUES (?, ?, ?);`;
        await connection.execute(insert_sql, [username, email, user_id]);

        console.log("✅ User stored successfully in database!");

        // ✅ Close connection
        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "User stored in database successfully!",
                user_id: user_id // Return the Cognito sub as user_id
            })
        };

    } catch (error) {
        console.error("❌ Error storing user in database!", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Database error!", error: error.message })
        };
    }
};
