import { Request, Response } from 'express';
import { appService } from '../services/app.service';

export class AppController {
  async list(_req: Request, res: Response) {
    const apps = await appService.list();
    res.json(apps);
  }
}
