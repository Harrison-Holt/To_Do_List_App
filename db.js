import pkg from 'pg'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const { Pool } = pkg; 

const pool = Pool({
    connectionString: process.env.DATABASE_URL_PROD, 
}); 

export default pool;