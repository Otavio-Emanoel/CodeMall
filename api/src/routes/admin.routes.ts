import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { authAdmin } from '../middlewares/authAdmin'

export const adminRoutes = Router()
const controller = new AdminController()

adminRoutes.use(authAdmin)

// Banir/Desbanir usuário
adminRoutes.post('/users/:id/ban', controller.banUser.bind(controller))
adminRoutes.post('/users/:id/unban', controller.unbanUser.bind(controller))

// Aprovar/Revogar produto
adminRoutes.post('/products/:id/approve', controller.approveProduct.bind(controller))
adminRoutes.post('/products/:id/revoke', controller.revokeProduct.bind(controller))
