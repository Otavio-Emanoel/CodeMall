import { Router } from 'express'
import { CartController } from '../controllers/cart.controller'

export const cartRoutes = Router()
const controller = new CartController()

// GET /api/cart?userId=1
cartRoutes.get('/', controller.list.bind(controller))
// POST /api/cart/add
cartRoutes.post('/add', controller.add.bind(controller))
// PATCH /api/cart/update
cartRoutes.patch('/update', controller.update.bind(controller))
// DELETE /api/cart/remove
cartRoutes.delete('/remove', controller.remove.bind(controller))
// POST /api/cart/clear
cartRoutes.post('/clear', controller.clear.bind(controller))
