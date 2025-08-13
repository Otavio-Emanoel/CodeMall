import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const controller = new UserController();
export const userRoutes = Router();

userRoutes.get('/', controller.list.bind(controller));
