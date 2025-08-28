import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/requireAuth';

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post('/register', controller.register.bind(controller));
authRoutes.post('/login', controller.login.bind(controller));
authRoutes.get('/me', requireAuth, (req, res) => {
	// @ts-ignore
	res.json({ user: (req as any).user });
});
