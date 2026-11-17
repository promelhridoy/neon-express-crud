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

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            age INT,
            is_Active BOOLEAN DEFAULT true,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );

            `);

            // Product Table

            await pool.query(`
                CREATE TABLE IF NOT EXISTS products(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price NUMERIC(10, 2) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
                 );
                `);

            console.log("Tables (users and products) are ready!");
    } catch (error) {
        console.log(error);
        
    }
}

initDB();

app.get("/", (req : Request, res: Response) => {
//   res.send("Hello World!");


res.status(200).json({
    success: true,
    message: "This is root route",
    author: "PHH",
})
});

app.post("/api/v1/users", async (req : Request, res: Response) => {
    try {
        const {name, email, password, age} = req.body;

        const result =await pool.query(`
            INSERT INTO users(name, email, password, age) VALUES
            ($1, $2, $3, $4) RETURNING *
            `, [name, email, password, age]
        );

            // console.log(result.rows[0]);
            


         res.status(201).json({
      success: true,
      message: "User created successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.get("/api/v1/users", async (req : Request, res: Response) => {
    try {
        
        const result =await pool.query(`
            SELECT * FROM users
            `,
        );

            // console.log(result.rows[0]);
            


         res.status(200).json({
      success: true,
      message: "User retrived successfully!!",
      data: result.rows
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.get("/api/v1/users/:id", async (req : Request, res: Response) => {
    try {

        const { id } =req.params;
        
        const result =await pool.query(`
            SELECT * FROM users
            WHERE id = $1
            `, [id],
        );

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "User retrived successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.put("/api/v1/users/:id", async (req : Request, res: Response) => {
    try {

        const { id } =req.params;

        const {name, password, age, is_Active} = req.body;
        
        const result =await pool.query(`
            UPDATE users
            SET
            name = COALESCE($1, name),
            password = COALESCE($2, password),
            age = COALESCE($3, age),
            is_Active = COALESCE($4, is_Active),
            updated_at = NOW()
            WHERE id = $5 RETURNING *
            `, [name ?? null, password ?? null, age ?? null, is_Active ?? null, id],
        );

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "User Updated Successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.delete("/api/v1/users/:id", async (req : Request, res: Response) => {
    try {

        const { id } =req.params;

        
        const result =await pool.query(`
            DELETE FROM users
            WHERE id = $1 RETURNING *
            `, [id],
        );

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "User Deleted Successfully!!",
    //   data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.post("/api/v1/products", async (req : Request, res: Response) => {
    try {
        const {name, description, price, stock, category} = req.body;

        const result =await pool.query(`
            INSERT INTO products(name, description, price, stock, category) VALUES
            ($1, $2, $3, $4, $5) RETURNING *
            `, [name, description, price, stock, category]
        );

            // console.log(result.rows[0]);
            


         res.status(201).json({
      success: true,
      message: "Product created successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.get("/api/v1/products", async (req: Request, res: Response): Promise<any> => {
    try {
        const { searchTerm, category, minPrice, maxPrice } = req.query;

        let query = `SELECT * FROM products WHERE 1=1`;
        const queryParams: any[] = [];
        let paramIndex = 1;

        // 1. Search by product name (using ILIKE for case-insensitive search)
        if (searchTerm) {
            query += ` AND name ILIKE $${paramIndex}`;
            queryParams.push(`%${searchTerm}%`);
            paramIndex++;
        }

        // 2. Filter by category
        if (category) {
            query += ` AND category ILIKE $${paramIndex}`;
            queryParams.push(`%${category}%`);
            paramIndex++;
        }

        // 3. Filter by minimum price
        if (minPrice) {
            query += ` AND price >= $${paramIndex}`;
            queryParams.push(minPrice);
            paramIndex++;
        }

        // 4. Filter by maximum price
        if (maxPrice) {
            query += ` AND price <= $${paramIndex}`;
            queryParams.push(maxPrice);
            paramIndex++;
        }

        query += ` ORDER BY id ASC`;

        const result = await pool.query(query, queryParams);

        return res.status(200).json({
            success: true,
            message: "Products retrieved successfully!",
            count: result.rowCount,
            data: result.rows,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error?.message,
            error: error,
        });
    }
});


app.get("/api/v1/products/:id", async (req : Request, res: Response) => {
    try {

        const { id } =req.params;
        
        const result =await pool.query(`
            SELECT * FROM products
            WHERE id = $1
            `, [id],
        );

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "Product retrived successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.put("/api/v1/product/:id", async (req : Request, res: Response) => {
    try {

        const { id } =req.params;

        const {name, description, price, stock, category} = req.body;
        
        const result =await pool.query(`
            UPDATE users
            SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            price = COALESCE($3, price),
            stock = COALESCE($4, stock),
            category = COALESCE($5, category),
            updated_at = NOW()
            WHERE id = $6 RETURNING *
            `, [name ?? null, description ?? null,price ?? null, stock ?? null, category ?? null, id],
        );

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "Product Updated Successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.delete("/api/v1/products/:id", async (req : Request, res: Response) => {
    try {

        const { id } =req.params;

        
        const result =await pool.query(`
            DELETE FROM products
            WHERE id = $1 RETURNING *
            `, [id],
        );

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "Product Deleted Successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
})

app.listen(config.port, () => {
    console.log(`The Express server is running on the port ${config.port}`);
})

