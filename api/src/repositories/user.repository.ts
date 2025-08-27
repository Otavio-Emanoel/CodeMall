import { pool } from '../config/database';

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  password_hash?: string | null;
  created_at: Date;
}

export const userRepository = {
  async findAll(): Promise<Pick<UserEntity, 'id' | 'name' | 'email' | 'role'>[]> {
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users ORDER BY id DESC'
    );
    // @ts-ignore
    return rows as any;
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, password_hash, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const arr = rows as any[];
    return arr.length ? (arr[0] as any) : null;
  },

  async findById(id: number): Promise<UserEntity | null> {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, password_hash, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    const arr = rows as any[];
    return arr.length ? (arr[0] as any) : null;
  },

  async create(data: { name: string; email: string; password_hash: string; role: 'buyer' | 'seller' | 'admin' }): Promise<UserEntity> {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [data.name, data.email, data.password_hash, data.role]
    );
    // @ts-ignore
    const id = result.insertId as number;
    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create user');
    return created;
  },
};
