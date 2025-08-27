import { Router, Request, Response } from 'express';
import { userRoutes } from './user.routes';
import { productRoutes } from './product.routes';
import { appRoutes } from './app.routes';
import { authRoutes } from './auth.routes';
// futuras: orderRoutes, paymentRoutes

export const router = Router();

router.get('/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/apps', appRoutes);
router.use('/auth', authRoutes);
