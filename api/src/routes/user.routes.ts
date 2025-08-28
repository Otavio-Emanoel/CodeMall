import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import multer from 'multer';

const controller = new UserController();
export const userRoutes = Router();

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

userRoutes.get('/', controller.list.bind(controller));
userRoutes.get('/:id', requireAuth, controller.get.bind(controller));
userRoutes.put('/:id', requireAuth, controller.update.bind(controller));
userRoutes.put('/:id/password', requireAuth, controller.updatePassword.bind(controller));
userRoutes.post('/:id/avatar', requireAuth, upload.single('file'), controller.updateAvatar.bind(controller));
