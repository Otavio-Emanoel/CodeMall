import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async list(_req: Request, res: Response) {
    const users = await userService.list();
    res.json(users);
  }

  async get(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    const isAdmin = auth?.role === 'admin';
    const isSelf = String(auth?.sub) === String(id);
    if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Forbidden' });

    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    const isAdmin = auth?.role === 'admin';
    const isSelf = String(auth?.sub) === String(id);
    if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Forbidden' });

    const { name, email } = req.body || {};
    if (!name && !email) return res.status(400).json({ error: 'Nothing to update' });
    try {
      const updated = await userService.update(id, { name, email });
      res.json(updated);
    } catch (e: any) {
      const msg = String(e?.message || 'Update failed');
      const status = /duplicate|already/i.test(msg) ? 409 : 400;
      res.status(status).json({ error: msg });
    }
  }
}
