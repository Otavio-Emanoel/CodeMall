import { Router } from 'express';
import { AppController } from './app.controller';

const controller = new AppController();
export const appRoutes = Router();

appRoutes.get('/', controller.list.bind(controller));
