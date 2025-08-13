import { Request, Response } from 'express';

export class AppController {
  async list(_req: Request, res: Response) {
    res.json([{ id: 1, name: 'Exemplo App', price: 0 }]);
  }
}
