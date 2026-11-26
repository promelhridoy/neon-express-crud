import express, { type Application, type Request, type Response } from "express";
import { pool } from "./db";
import { userRouter } from "./modules/users/user.route";
import { profileRoute } from "./modules/profile/profile.route";
import { authRouter } from "./modules/auth/auth.route";
import logger from "./middleware/logger";
import globalErrorHandler from "./middleware/globalErrorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { productRoute } from "./modules/products/product.route";

const app: Application = express();

const corsOptions = {
    origin: ["http://localhost:3000"],
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger)



app.use("/api/v1/users", userRouter)
app.use("/api/v1/profile", profileRoute)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/products", productRoute)




app.get("/", (req : Request, res: Response) => {
//   res.send("Hello World!");


res.status(200).json({
    success: true,
    message: "This is root route",
    author: "PHH",
})
});



// Global Error Handling Middleware
app.use(globalErrorHandler);









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

export default app;