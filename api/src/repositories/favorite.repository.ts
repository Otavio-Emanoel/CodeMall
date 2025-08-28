import { pool } from '../config/database'

export type FavoriteTarget = 'product' | 'seller'

export interface FavoriteEntity {
  id: number
  buyer_id: number
  target_type: FavoriteTarget
  target_id: number
  created_at: Date
}

export const favoriteRepository = {
  async add(buyerId: number, targetType: FavoriteTarget, targetId: number): Promise<FavoriteEntity> {
    await pool.query(
      `INSERT IGNORE INTO favorites (buyer_id, target_type, target_id) VALUES (?, ?, ?)`,
      [buyerId, targetType, targetId]
    )
    const [rows] = await pool.query(
      `SELECT * FROM favorites WHERE buyer_id = ? AND target_type = ? AND target_id = ? LIMIT 1`,
      [buyerId, targetType, targetId]
    )
    // @ts-ignore
    return (rows as any[])[0]
  },

  async remove(buyerId: number, targetType: FavoriteTarget, targetId: number): Promise<void> {
    await pool.query(
      `DELETE FROM favorites WHERE buyer_id = ? AND target_type = ? AND target_id = ?`,
      [buyerId, targetType, targetId]
    )
  },

  async list(buyerId: number, targetType?: FavoriteTarget): Promise<FavoriteEntity[]> {
    if (targetType) {
      const [rows] = await pool.query(
        `SELECT * FROM favorites WHERE buyer_id = ? AND target_type = ? ORDER BY created_at DESC`,
        [buyerId, targetType]
      )
      // @ts-ignore
      return rows as any
    }
    const [rows] = await pool.query(
      `SELECT * FROM favorites WHERE buyer_id = ? ORDER BY created_at DESC`,
      [buyerId]
    )
    // @ts-ignore
    return rows as any
  },
}
