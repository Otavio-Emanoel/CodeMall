import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body || {};
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'name, email, password and role are required' });
      }
      const result = await authService.register({ name, email, password, role });
      res.status(201).json(result);
    } catch (e: any) {
      const msg = String(e?.message || 'Registration failed');
      const status = msg.includes('already in use') ? 409 : 400;
      res.status(status).json({ error: msg });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
      }
      const result = await authService.login({ email, password });
      res.json(result);
    } catch (e: any) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
}
