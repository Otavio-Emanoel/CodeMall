import { Request, Response } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async list(req: Request, res: Response) {
    try {
      const { q, type, page, pageSize } = req.query;
      const result = await productService.list({
        q: typeof q === 'string' ? q : undefined,
        type: typeof type === 'string' ? type : undefined,
        page: typeof page === 'string' ? parseInt(page, 10) : undefined,
        pageSize: typeof pageSize === 'string' ? parseInt(pageSize, 10) : undefined,
      });
      res.json(result);
    } catch (err) {
      console.error('Erro ao listar produtos:', err);
      res.status(500).json({ error: 'Falha ao listar produtos' });
    }
  }
}
