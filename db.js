import pkg from 'pg'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const { Pool } = pkg;

let pool;

try {
    // Check if the connection string is provided
    if (!process.env.DATABASE_URL_PROD) {
        throw new Error('DATABASE_URL_PROD is not set in environment variables');
    }

    // Initialize the pool
    pool = new Pool({
        connectionString: process.env.DATABASE_URL_PROD,
        ssl: {
            rejectUnauthorized: false  
        }
    });

    // Test the connection
    pool.connect((err, client, release) => {
        if (err) {
            console.error('Error acquiring client', err.stack);
        } else {
            console.log('Database connection successful');
        }
        release();  
    });

} catch (error) {
    console.error('Failed to set up the database pool:', error.message);
    process.exit(1); 
}

export default pool;
