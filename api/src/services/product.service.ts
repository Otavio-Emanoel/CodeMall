import { pool } from '../config/database';
import type { RowDataPacket } from 'mysql2';

export interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  type: string;
  price: number;
  created_at: string;
}

export const productService = {
  async list(opts?: { q?: string; type?: string; page?: number; pageSize?: number }) {
    const q = opts?.q?.trim();
    const type = opts?.type?.trim();
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
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query<ProductRow[]>(
      `SELECT id, name, type, price, created_at
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
};
