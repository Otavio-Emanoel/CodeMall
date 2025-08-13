import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;

const app = createApp();

app.listen(PORT, () => {
  console.log(`CodeMall API rodando na porta ${PORT}`);
});
