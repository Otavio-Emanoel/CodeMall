import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const controller = new ProductController();
export const productRoutes = Router();

productRoutes.get('/', controller.list.bind(controller));
productRoutes.get('/:id', controller.get.bind(controller));
productRoutes.post('/', requireAuth, controller.create.bind(controller));
productRoutes.put('/:id', requireAuth, controller.update.bind(controller));
productRoutes.delete('/:id', requireAuth, controller.remove.bind(controller));
