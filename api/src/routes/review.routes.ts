import { Router } from 'express'
import { ReviewController } from '../controllers/review.controller'

export const reviewRoutes = Router()
const controller = new ReviewController()

// Criar avaliação (comprador)
reviewRoutes.post('/', controller.create.bind(controller))

// Listar avaliações por alvo (produto/vendedor)
// GET /api/reviews?targetType=product&targetId=101
reviewRoutes.get('/', controller.list.bind(controller))

// Resumo (média e contagem)
reviewRoutes.get('/summary', controller.summary.bind(controller))

// Responder avaliação (vendedor)
reviewRoutes.post('/:id/reply', controller.reply.bind(controller))
