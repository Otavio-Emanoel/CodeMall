import { Router, Request, Response } from 'express';
import { userRoutes } from '../modules/users/user.routes';
import { appRoutes } from '../modules/apps/app.routes';
// futuras: authRoutes, orderRoutes, paymentRoutes

export const router = Router();

router.get('/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

router.use('/users', userRoutes);
router.use('/apps', appRoutes);
