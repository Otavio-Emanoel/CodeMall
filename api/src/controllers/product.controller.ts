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

  async get(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const prod = await productService.getById(id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  }

  async create(req: Request, res: Response) {
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    if (!auth || (auth.role !== 'seller' && auth.role !== 'admin')) {
      return res.status(403).json({ error: 'Only sellers can create products' });
    }
    const { name, type, category, price } = req.body || {};
    if (!name || !type || typeof price !== 'number') {
      return res.status(400).json({ error: 'name, type and price are required' });
    }
    try {
      const prod = await productService.create({ name, type, category, price, sellerId: Number(auth.sub) });
      res.status(201).json(prod);
    } catch (e) {
      res.status(400).json({ error: 'Failed to create product' });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    const prod = await productService.getById(id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    const isOwner = String(prod.seller_id ?? '') === String(auth.sub);
    const isAdmin = auth.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });
    const { name, type, category, price } = req.body || {};
    const updated = await productService.update(id, { name, type, category, price });
    res.json(updated);
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    // @ts-ignore
    const auth = (req as any).user as { sub: number | string; role: string } | undefined;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    const prod = await productService.getById(id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    const isOwner = String(prod.seller_id ?? '') === String(auth.sub);
    const isAdmin = auth.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });
    await productService.remove(id);
    res.status(204).send();
  }
}
