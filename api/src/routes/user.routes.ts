import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const controller = new UserController();
export const userRoutes = Router();

userRoutes.get('/', controller.list.bind(controller));
userRoutes.get('/:id', requireAuth, controller.get.bind(controller));
userRoutes.put('/:id', requireAuth, controller.update.bind(controller));
