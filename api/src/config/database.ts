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
    password: process.env.DB_PASSWORD as string,
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

    // Evolução de schema para products: category e seller_id
    type ColRow2 = RowDataPacket & { COLUMN_NAME: string; COLUMN_TYPE: string };
    const [prodCols] = await conn.query<ColRow2[]>(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'`
    );
    const pcols = new Map(prodCols.map(r => [r.COLUMN_NAME, r] as const));
    if (!pcols.has('category')) {
      await conn.query(`ALTER TABLE products ADD COLUMN category VARCHAR(100) NULL AFTER type`);
    }
    if (!pcols.has('seller_id')) {
      await conn.query(`ALTER TABLE products ADD COLUMN seller_id INT NULL AFTER price`);
    }
    // Admin: approved flag
    if (!pcols.has('approved')) {
      await conn.query(`ALTER TABLE products ADD COLUMN approved TINYINT(1) NOT NULL DEFAULT 0 AFTER seller_id`);
    }
    // Índices para filtros e joins
    type Idx2 = RowDataPacket & { index_name: string };
    const [idxSeller] = await conn.query<Idx2[]>(
      `SELECT index_name FROM information_schema.statistics
       WHERE table_schema = DATABASE() AND table_name = 'products'
         AND column_name = 'seller_id' LIMIT 1`
    );
    if (!Array.isArray(idxSeller) || idxSeller.length === 0) {
      await conn.query(`CREATE INDEX idx_products_seller_id ON products(seller_id)`);
    }
    const [idxCategory] = await conn.query<Idx2[]>(
      `SELECT index_name FROM information_schema.statistics
       WHERE table_schema = DATABASE() AND table_name = 'products'
         AND column_name = 'category' LIMIT 1`
    );
    if (!Array.isArray(idxCategory) || idxCategory.length === 0) {
      await conn.query(`CREATE INDEX idx_products_category ON products(category)`);
    }

    // Tabela de imagens de produtos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        url VARCHAR(512) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_images_product_id (product_id),
        CONSTRAINT fk_product_images_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabela de usuários (base mínima)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Descobre colunas atuais da tabela users
    type ColRow = RowDataPacket & { COLUMN_NAME: string; DATA_TYPE: string; COLUMN_TYPE: string; IS_NULLABLE: 'YES' | 'NO' };
    const [colRows] = await conn.query<ColRow[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );
    const cols = new Map(colRows.map(r => [r.COLUMN_NAME, r] as const));

    // Adiciona email se não existir (usar 191 para compatibilidade com índices em utf8mb4)
    if (!cols.has('email')) {
      await conn.query(`ALTER TABLE users ADD COLUMN email VARCHAR(191) NULL`);
    } else {
      // Se email existir mas for maior que 191, reduzir
      const emailCol = cols.get('email')!;
      const type = emailCol.COLUMN_TYPE.toLowerCase();
      const match = type.match(/varchar\((\d+)\)/);
      const size = match ? parseInt(match[1], 10) : null;
      if (size && size > 191) {
        await conn.query(`ALTER TABLE users MODIFY COLUMN email VARCHAR(191) NULL`);
      }
    }

    // Adiciona password_hash se não existir
    if (!cols.has('password_hash')) {
      await conn.query(`ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL`);
    }

    // Admin: banned flag
    if (!cols.has('banned')) {
      await conn.query(`ALTER TABLE users ADD COLUMN banned TINYINT(1) NOT NULL DEFAULT 0`);
    }

    // Garante tipo de role como ENUM
    const roleCol = cols.get('role');
    if (!roleCol || !roleCol.COLUMN_TYPE.toLowerCase().startsWith('enum(')) {
      await conn.query(`
        ALTER TABLE users
        MODIFY COLUMN role ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer'
      `);
    }

    // Garante índice único em email (se não existir)
    type IdxRow = RowDataPacket & { index_name: string };
    const [idxRows] = await conn.query<IdxRow[]>(
      `SELECT index_name
       FROM information_schema.statistics
       WHERE table_schema = DATABASE()
         AND table_name = 'users'
         AND column_name = 'email'
         AND non_unique = 0
       LIMIT 1`
    );
    if (!Array.isArray(idxRows) || idxRows.length === 0) {
      // cria unique index (após garantir tamanho <= 191)
      await conn.query(`ALTER TABLE users ADD UNIQUE uk_users_email (email)`);
    }

    // Tabela de favoritos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buyer_id INT NOT NULL,
        target_type ENUM('product','seller') NOT NULL,
        target_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_favorites_buyer_target (buyer_id, target_type, target_id)
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
        'INSERT INTO products (name, type, price, approved) VALUES (?, ?, ?, 1), (?, ?, ?, 1)',
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
