import { Request, Response } from 'express';

export class UserController {
  async list(_req: Request, res: Response) {
    // TODO: integrar com repositório
    res.json([{ id: 1, name: 'Demo User' }]);
  }
}
