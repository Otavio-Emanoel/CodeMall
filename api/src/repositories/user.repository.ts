import { pool } from '../config/database';

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  password_hash?: string | null;
  created_at: Date;
  avatar?: string | null;
}

export const userRepository = {
  async findAll(): Promise<Pick<UserEntity, 'id' | 'name' | 'email' | 'role' | 'avatar'>[]> {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar FROM users ORDER BY id DESC'
    );
    // @ts-ignore
    return rows as any;
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, password_hash, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const arr = rows as any[];
    return arr.length ? (arr[0] as any) : null;
  },

  async findById(id: number): Promise<UserEntity | null> {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, password_hash, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    const arr = rows as any[];
    return arr.length ? (arr[0] as any) : null;
  },

  async create(data: { name: string; email: string; password_hash: string; role: 'buyer' | 'seller' | 'admin'; avatar?: string | null }): Promise<UserEntity> {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.email, data.password_hash, data.role, data.avatar ?? null]
    );
    // @ts-ignore
    const id = result.insertId as number;
    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create user');
    return created;
  },

  async update(id: number, data: { name?: string; email?: string; avatar?: string | null }): Promise<UserEntity> {
    // Check conflict for email
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('Email already in use');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    if (typeof data.name === 'string') {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (typeof data.email === 'string') {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.hasOwnProperty('avatar')) {
      fields.push('avatar = ?');
      values.push(data.avatar ?? null);
    }
    if (fields.length === 0) {
      const current = await this.findById(id);
      if (!current) throw new Error('User not found');
      return current;
    }
    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  },

  async updatePassword(id: number, password_hash: string): Promise<void> {
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
  },
};
