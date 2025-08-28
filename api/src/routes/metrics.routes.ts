import { Router } from 'express'
import { MetricsController } from '../controllers/metrics.controller'
import { authAdmin } from '../middlewares/authAdmin'

export const metricsRoutes = Router()
const controller = new MetricsController()

// Dashboard de métricas (apenas admin)
metricsRoutes.get('/dashboard', authAdmin, controller.dashboard.bind(controller))
