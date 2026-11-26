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

export const productService = {
  createProductIntoDB,
};