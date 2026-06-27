import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let pool;

const db = {
  async get(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  },
  async all(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  async run(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return result;
  },
};

export async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'monica';
  const password = process.env.DB_PASS || 'monica123';
  const database = process.env.DB_NAME || 'st_monica';

  pool = mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 10 });

  const schemaPath = join(__dirname, 'schema.sql');
  if (readFileSync) {
    const sql = readFileSync(schemaPath, 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await pool.execute(stmt);
    }
  }

  for (const col of ['homepage']) {
    for (const tbl of ['events', 'gallery', 'spotlight', 'sports']) {
      try { await pool.execute(`ALTER TABLE ${tbl} ADD COLUMN ${col} TINYINT(1) DEFAULT 0`); } catch {}
    }
  }
  try { await pool.execute('ALTER TABLE sports ADD COLUMN notes2 TEXT DEFAULT NULL'); } catch {}

  const [rows] = await pool.execute('SELECT COUNT(*) as c FROM users');
  if (rows[0].c === 0) {
    const hashed = await bcrypt.hash('@Gr4ktung978', 10);
    await pool.execute("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', hashed]);
  }

  return db;
}

export default db;
