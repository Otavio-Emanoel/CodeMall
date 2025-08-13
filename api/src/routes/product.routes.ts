import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const controller = new ProductController();
export const productRoutes = Router();

productRoutes.get('/', controller.list.bind(controller));
