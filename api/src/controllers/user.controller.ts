import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async list(_req: Request, res: Response) {
    const users = await userService.list();
    res.json(users);
  }
}
