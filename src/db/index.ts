import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
    // connectionString:  process.env.DATABASE_URL_UNPOOLED,
    connectionString:  config.connection_string,
}); 


export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            age INT,
            is_Active BOOLEAN DEFAULT true,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );

            `);

            await pool.query(`
        CREATE TABLE IF NOT EXISTS profile(
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

        bio TEXT,
        address TEXT,
        phone VARCHAR(15),
        gender VARCHAR(15),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

            // Product Table

            await pool.query(`
                CREATE TABLE IF NOT EXISTS products(
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
                stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
                 );
                `);

            console.log("Database Connected Successfully!");
    } catch (error) {
        console.log(error);
        
    }
}