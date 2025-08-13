import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes/index';

dotenv.config();

export function createApp(): Application {
	const app = express();
	app.use(cors());
	app.use(express.json());

	// Health check
		app.get('/health', (_req: Request, res: Response) => {
			res.json({ status: 'ok', uptime: process.uptime() });
		});

	app.use('/api', router);

	// 404 handler
		app.use((req: Request, res: Response) => {
			res.status(404).json({ error: 'Not Found', path: req.path });
		});

	// Error handler
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
		app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
		console.error('Unhandled error:', err);
		res.status(500).json({ error: 'Internal Server Error' });
	});

	return app;
}
