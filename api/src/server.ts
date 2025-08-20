import { createApp } from './app';
import dotenv from 'dotenv';
import { ensureDatabaseAndSchema } from './config/database';
import net from 'net';

dotenv.config();

const BASE_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;

async function findAvailablePort(start: number, maxAttempts = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = start;
    let attempts = 0;

    const tryPort = () => {
      const tester = net.createServer()
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            attempts += 1;
            port += 1;
            if (attempts >= maxAttempts) {
              reject(new Error(`Nenhuma porta disponível entre ${start} e ${port}`));
            } else {
              tryPort();
            }
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(port));
        })
        .listen(port);
    };
    tryPort();
  });
}

async function bootstrap() {
  try {
    console.log('> Preparando banco de dados (MySQL)...');
    await ensureDatabaseAndSchema();
    console.log('> Banco de dados pronto. Iniciando servidor...');

    const port = await findAvailablePort(BASE_PORT);
    const app = createApp();
    app.listen(port, () => {
      console.log(`CodeMall API rodando na porta ${port}`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

bootstrap();
