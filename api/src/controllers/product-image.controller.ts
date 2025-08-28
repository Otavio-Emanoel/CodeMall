import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { productImageRepository } from '../repositories/product-image.repository';

export class ProductImageController {
  async list(req: Request, res: Response) {
    const productId = Number(req.params.productId);
    if (!Number.isFinite(productId)) return res.status(400).json({ error: 'Invalid productId' });
    const images = await productImageRepository.listByProduct(productId);
    res.json({ data: images });
  }

  async upload(req: Request, res: Response) {
    const productId = Number(req.params.productId);
    if (!Number.isFinite(productId)) return res.status(400).json({ error: 'Invalid productId' });

    // @ts-ignore
    const auth = (req as any).user as { id?: number | string; sub?: number | string; role: string } | undefined;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });

    const product = await productService.getById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const userId = String((auth as any).sub ?? (auth as any).id ?? '');
    const isOwner = String(product.seller_id ?? '') === userId;
    const isAdmin = auth.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    // Arquivo deve estar em req.file (multer) ou req.body { filename, url }
    const file: any = (req as any).file;
    const { filename: bodyFilename, url: bodyUrl } = req.body || {};

    let filename: string | undefined;
    let url: string | undefined;

    if (file && typeof file.originalname === 'string') {
      // originalname: nome do arquivo enviado; file.filename: nome gerado no disco
      filename = file.originalname;
      url = `/uploads/${file.filename}`;
    } else if (typeof bodyFilename === 'string' && typeof bodyUrl === 'string') {
      filename = bodyFilename;
      url = bodyUrl;
    }

    if (!filename || !url) return res.status(400).json({ error: 'Missing file or filename/url' });

    const saved = await productImageRepository.add(productId, filename, url);
    res.status(201).json(saved);
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.imageId);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid imageId' });

    // @ts-ignore
    const auth = (req as any).user as { id?: number | string; sub?: number | string; role: string } | undefined;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });

    const img = await productImageRepository.findById(id);
    if (!img) return res.status(404).json({ error: 'Image not found' });

    const product = await productService.getById(img.product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const userId = String((auth as any).sub ?? (auth as any).id ?? '');
    const isOwner = String(product.seller_id ?? '') === userId;
    const isAdmin = auth.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    await productImageRepository.remove(id);
    res.status(204).send();
  }
}
