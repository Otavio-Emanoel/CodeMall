import { pool } from '../config/database';
import type { RowDataPacket } from 'mysql2';

export interface ProductImageRow extends RowDataPacket {
  id: number;
  product_id: number;
  filename: string;
  url: string;
  created_at: string;
}

export const productImageRepository = {
  async add(productId: number, filename: string, url: string) {
    const [result] = await pool.query(
      `INSERT INTO product_images (product_id, filename, url) VALUES (?, ?, ?)`,
      [productId, filename, url]
    );
    // @ts-ignore
    const id = result.insertId as number;
    const [rows] = await pool.query<ProductImageRow[]>(
      `SELECT id, product_id, filename, url, created_at FROM product_images WHERE id = ? LIMIT 1`,
      [id]
    );
    return (rows as any)[0];
  },

  async listByProduct(productId: number) {
    const [rows] = await pool.query<ProductImageRow[]>(
      `SELECT id, product_id, filename, url, created_at FROM product_images WHERE product_id = ? ORDER BY id DESC`,
      [productId]
    );
    return rows as unknown as ProductImageRow[];
  },

  async findById(id: number) {
    const [rows] = await pool.query<ProductImageRow[]>(
      `SELECT id, product_id, filename, url, created_at FROM product_images WHERE id = ? LIMIT 1`,
      [id]
    );
    return (rows as any)[0] || null;
  },

  async remove(id: number) {
    await pool.query(`DELETE FROM product_images WHERE id = ?`, [id]);
    return true;
  }
};