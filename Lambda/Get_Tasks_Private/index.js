import mysql2 from 'mysql2'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const db_config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
}

export const handker = async (event) => {

    let connection; 

    try {

        const { user_id } = event; 

        connection = await mysql2.createConnection(db_config); 

        const get_sql = `SELECT tasks WHERE user_id = ?`; 

       const [result] = await connection.execute(get_sql, [user_id]); 

       return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Got Users Tasks!', affectedRows: result.affectedRows})
       }
    } catch(error) {
        console.error('Error getting users task!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Error getting users task!', error: error.message})
        }
    }
}