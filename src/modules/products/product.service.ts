import { pool } from "../../db";
import type { IProduct } from './product.interface';

const createProductIntoDB = async (payload: IProduct) => {
  const { user_id, name, description, price, stock, category } = payload;

  const user = await pool.query(`SELECT id FROM users WHERE id = $1`, [user_id]);

  if (user.rowCount === 0) {
    throw new Error("User does not exist in the database!!");
  }

  const result = await pool.query(
    `
    INSERT INTO products (user_id, name, description, price, stock, category)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [user_id, name, description ?? null, price, stock ?? 0, category ?? null]
  );

  return result.rows[0];
};

const getAllProductFromDB = async (queryObj: Record<string, any>) => {
  const { searchTerm, category, minPrice, maxPrice } = queryObj;

  let query = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.category,
      p.created_at,
      p.updated_at,
      json_build_object('id', u.id, 'name', u.name) AS user
    FROM products p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (searchTerm) {
    query += ` AND p.name ILIKE $${paramIndex}`;
    queryParams.push(`%${searchTerm}%`);
    paramIndex++;
  }

  if (category) {
    query += ` AND p.category ILIKE $${paramIndex}`;
    queryParams.push(`%${category}%`);
    paramIndex++;
  }

  if (minPrice) {
    query += ` AND p.price >= $${paramIndex}`;
    queryParams.push(minPrice);
    paramIndex++;
  }

  if (maxPrice) {
    query += ` AND p.price <= $${paramIndex}`;
    queryParams.push(maxPrice);
    paramIndex++;
  }

  query += ` ORDER BY p.id ASC`;

  const result = await pool.query(query, queryParams);
  return result;
};

export const productService = {
  createProductIntoDB,
  getAllProductFromDB,
};