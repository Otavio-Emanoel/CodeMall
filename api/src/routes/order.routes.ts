import { Router } from 'express'
import { OrderController } from '../controllers/order.controller'

export const orderRoutes = Router()
const controller = new OrderController()

// Criar pedido (comprador)
orderRoutes.post('/', controller.create.bind(controller))

// Buscar pedido por id
orderRoutes.get('/:id', controller.get.bind(controller))

// Listar pedidos do usuário (comprador ou vendedor)
// Ex.: GET /api/orders/mine?userId=1&role=buyer|seller
orderRoutes.get('/mine/list', controller.listMine.bind(controller))

// Atualizar status do pedido (admin/vendedor)
orderRoutes.patch('/:id/status', controller.updateStatus.bind(controller))
