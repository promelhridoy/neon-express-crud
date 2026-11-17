import express, { type Application, type Request, type Response } from "express";
import config from "./config";
import { Pool } from "pg";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    // connectionString:  process.env.DATABASE_URL_UNPOOLED,
    connectionString:  config.connection_string,
});

// Test database connection on server startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to NeonDB successfully at:', res.rows[0].now);
    }
});

app.get("/", (req : Request, res: Response) => {
//   res.send("Hello World!");


res.status(200).json({
    success: true,
    message: "This is root route",
    author: "PHH",
})
});

app.listen(config.port, () => {
    console.log(`The Express server is running on the port ${config.port}`);
})

