import { Request, Response } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async list(_req: Request, res: Response) {
    const products = await productService.list();
    res.json(products);
  }
}
