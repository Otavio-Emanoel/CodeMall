import { Router } from 'express'
import { NotificationController } from '../controllers/notification.controller'

export const notificationRoutes = Router()
const controller = new NotificationController()

// Listar notificações do usuário
// GET /api/notifications?userId=1
notificationRoutes.get('/', controller.listMine.bind(controller))

// Marcar 1 notificação como lida
notificationRoutes.post('/:id/read', controller.markRead.bind(controller))

// Marcar todas como lidas de um usuário
notificationRoutes.post('/read-all', controller.markAll.bind(controller))
