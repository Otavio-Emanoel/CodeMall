import { Router } from 'express';
import { ProductImageController } from '../controllers/product-image.controller';
import { requireAuth } from '../middlewares/requireAuth';
import multer from 'multer';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

const controller = new ProductImageController();
export const productImageRoutes = Router({ mergeParams: true });

// Lista imagens de um produto
productImageRoutes.get('/', controller.list.bind(controller));

// Upload (aceita multipart/form-data com campo 'file' OU JSON { filename, url })
productImageRoutes.post('/', requireAuth, upload.single('file'), controller.upload.bind(controller));

// Remover imagem específica
productImageRoutes.delete('/:imageId', requireAuth, controller.remove.bind(controller));
