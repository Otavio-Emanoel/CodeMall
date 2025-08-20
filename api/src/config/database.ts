import mysql, { Pool } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Pool principal (setado após ensureDatabaseAndSchema)
export let pool: Pool;

function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'codemall',
    connectionLimit: 10,
  } as const;
}

export async function ensureDatabaseAndSchema(): Promise<void> {
  const cfg = getDbConfig();

  // 1) Garante que o database exista (conecta sem 'database')
  let serverConn;
  let lastErr: any;
  const attempts = [
    { host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password },
    // Fallback comum em instalações locais do MySQL (senha vazia para root)
    { host: cfg.host, port: cfg.port, user: cfg.user, password: '' },
  ];
  let usedCreds: { host: string; port: number; user: string; password: string | undefined } | null = null;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Tenta conectar por até ~30s (10 tentativas x 3s)
  for (let i = 0; i < 10 && !serverConn; i++) {
  for (const a of attempts) {
      try {
    serverConn = await mysql.createConnection({ ...a, multipleStatements: true });
    usedCreds = a;
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!serverConn) {
      await sleep(3000);
    }
  }
  if (!serverConn) {
    const hint =
      '\nDica: verifique se o servidor MySQL está rodando e as variáveis DB_USER/DB_PASSWORD. ' +
      'Você pode subir rapidamente com Docker: "npm run db:up" dentro de api/ (requer Docker).';
    throw new Error(`Não foi possível conectar ao MySQL para criar o database. ${hint}\nErro original: ${lastErr?.message || lastErr}`);
  }

  const dbName = cfg.database as string;
  await serverConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await serverConn.end();

  // 2) Cria o pool já apontando para o database usando as credenciais que funcionaram
  const effectivePassword = usedCreds?.password ?? cfg.password;
  pool = mysql.createPool({ ...cfg, password: effectivePassword });

  // 3) Cria tabelas se não existirem
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Opcional: tabela de usuários simples (como exemplo)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4) Seed básico de products se estiver vazio
    interface CountRow extends RowDataPacket { count: number }
    const [rows] = await conn.query<CountRow[]>(
      'SELECT COUNT(*) as count FROM products'
    );
    const count = Array.isArray(rows) && (rows[0] as CountRow)?.count ? Number((rows[0] as CountRow).count) : 0;
    if (count === 0) {
      await conn.query(
        'INSERT INTO products (name, type, price) VALUES (?, ?, ?), (?, ?, ?)',
        ['Plugin Analytics', 'addon', 19.9, 'Tema Dark Pro', 'theme', 5.5]
      );
    }
  } finally {
    conn.release();
  }
}

export async function dbHealthCheck(): Promise<boolean> {
  try {
    if (!pool) return false;
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (e) {
    return false;
  }
}
