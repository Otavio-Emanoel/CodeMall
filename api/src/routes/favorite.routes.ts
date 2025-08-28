import { Router } from 'express'
import { FavoriteController } from '../controllers/favorite.controller'

export const favoriteRoutes = Router()
const controller = new FavoriteController()

favoriteRoutes.post('/', controller.add.bind(controller))
favoriteRoutes.delete('/', controller.remove.bind(controller))
favoriteRoutes.get('/', controller.list.bind(controller))
