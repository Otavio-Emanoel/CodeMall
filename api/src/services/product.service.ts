import { pool } from '../config/database';
import type { RowDataPacket } from 'mysql2';

export interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  type: string;
  category?: string | null;
  price: number;
  seller_id?: number | null;
  created_at: string;
}

export const productService = {
  async list(opts?: { q?: string; type?: string; category?: string; minPrice?: number; maxPrice?: number; sellerId?: number; page?: number; pageSize?: number }) {
    const q = opts?.q?.trim();
    const type = opts?.type?.trim();
    const category = opts?.category?.trim();
    const minPrice = typeof opts?.minPrice === 'number' ? opts!.minPrice : undefined;
    const maxPrice = typeof opts?.maxPrice === 'number' ? opts!.maxPrice : undefined;
    const sellerId = typeof opts?.sellerId === 'number' ? opts!.sellerId : undefined;
    const page = Math.max(1, opts?.page || 1);
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const params: any[] = [];
    if (q) {
      where.push('(name LIKE ? OR type LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (type) {
      where.push('type = ?');
      params.push(type);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (typeof minPrice === 'number') {
      where.push('price >= ?');
      params.push(minPrice);
    }
    if (typeof maxPrice === 'number') {
      where.push('price <= ?');
      params.push(maxPrice);
    }
    if (typeof sellerId === 'number') {
      where.push('seller_id = ?');
      params.push(sellerId);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query<ProductRow[]>(
      `SELECT id, name, type, category, price, seller_id, created_at
       FROM products
       ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [countRows] = await pool.query<{ count: number }[] & RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM products ${whereSql}`,
      params
    );
    const total = (countRows as any)[0]?.count ? Number((countRows as any)[0].count) : 0;

    return {
      data: rows,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async create(data: { name: string; type: string; category?: string | null; price: number; sellerId: number }) {
    const [result] = await pool.query(
      `INSERT INTO products (name, type, category, price, seller_id) VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.type, data.category ?? null, data.price, data.sellerId]
    );
    // @ts-ignore
    const id = result.insertId as number;
    const [rows] = await pool.query<ProductRow[]>(`SELECT * FROM products WHERE id = ? LIMIT 1`, [id]);
    return (rows as any)[0];
  },

  async getById(id: number) {
    const [rows] = await pool.query<ProductRow[]>(`SELECT * FROM products WHERE id = ? LIMIT 1`, [id]);
    return (rows as any)[0] || null;
  },

  async update(id: number, data: { name?: string; type?: string; category?: string | null; price?: number }) {
    const fields: string[] = [];
    const values: any[] = [];
    if (typeof data.name === 'string') { fields.push('name = ?'); values.push(data.name); }
    if (typeof data.type === 'string') { fields.push('type = ?'); values.push(data.type); }
    if (typeof data.category !== 'undefined') { fields.push('category = ?'); values.push(data.category); }
    if (typeof data.price === 'number') { fields.push('price = ?'); values.push(data.price); }
    if (fields.length === 0) return this.getById(id);
    values.push(id);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  },

  async remove(id: number) {
    await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
    return true;
  }
};
