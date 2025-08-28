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

    const { name, email, avatar } = req.body || {};
    if (!name && !email && typeof avatar === 'undefined') return res.status(400).json({ error: 'Nothing to update' });
    try {
      const updated = await userService.update(id, { name, email, avatar });
      res.json(updated);
    } catch (e: any) {
      const msg = String(e?.message || 'Update failed');
      const status = /duplicate|already/i.test(msg) ? 409 : 400;
      res.status(status).json({ error: msg });
    }
  }

  async updatePassword(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    const isAdmin = auth?.role === 'admin';
    const isSelf = String(auth?.sub) === String(id);
    if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Forbidden' });

    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || (!isAdmin && !currentPassword)) {
      return res.status(400).json({ error: 'Missing newPassword or currentPassword' });
    }
    try {
      await userService.changePassword(id, { currentPassword, newPassword }, { force: isAdmin && !isSelf });
      res.json({ ok: true });
    } catch (e: any) {
      const msg = String(e?.message || 'Password update failed');
      const status = /invalid|not found/i.test(msg) ? 400 : 500;
      res.status(status).json({ error: msg });
    }
  }

  async updateAvatar(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    const isAdmin = auth?.role === 'admin';
    const isSelf = String(auth?.sub) === String(id);
    if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Forbidden' });

    // Arquivo via multer ou URL direta no body
    const file: any = (req as any).file;
    const incomingUrl: string | undefined = (req.body && (req.body.url as string)) || undefined;

    let url: string | undefined;
    if (file && typeof file.filename === 'string') {
      url = `/uploads/${file.filename}`;
    } else if (incomingUrl && typeof incomingUrl === 'string') {
      url = incomingUrl;
    }

    if (!url) return res.status(400).json({ error: 'Missing file or url' });

    try {
      const updated = await userService.update(id, { avatar: url });
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e?.message || 'Failed to update avatar' });
    }
  }
}
