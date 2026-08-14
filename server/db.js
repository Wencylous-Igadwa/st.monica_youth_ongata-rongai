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
    const [rows] = await pool.query(sql, params);
    return rows[0];
  },
  async all(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  async run(sql, params = []) {
    const [result] = await pool.query(sql, params);
    return result;
  },
};

export async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'monica';
  // Accepts either DB_PASS or DB_PASSWORD so Render environment variables match
  const password = process.env.DB_PASS || process.env.DB_PASSWORD || 'monica123';
  const database = process.env.DB_NAME || 'st_monica';

  // Enable SSL for cloud hosting providers (e.g. Aiven) when host is non-local
  const sslConfig = host !== 'localhost' && host !== '127.0.0.1'
    ? { rejectUnauthorized: false }
    : false;

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
  });

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
  try { await pool.execute('ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT ""'); } catch {}
  try { await pool.execute('ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT ""'); } catch {}
  try { await pool.execute('ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'); } catch {}
  try { await pool.execute('ALTER TABLE users MODIFY COLUMN username VARCHAR(255) DEFAULT NULL'); } catch {}
  try { await pool.execute('CREATE UNIQUE INDEX idx_users_email ON users(email)'); } catch {}

  let usersColumnsAdded = false;
  try { await pool.execute('ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT "pending"'); usersColumnsAdded = true; } catch {}
  try { await pool.execute('ALTER TABLE users ADD COLUMN is_member TINYINT(1) NOT NULL DEFAULT 0'); } catch {}
  try { await pool.execute('ALTER TABLE users ADD COLUMN verified_at DATETIME DEFAULT NULL'); } catch {}

  if (usersColumnsAdded) {
    try { await pool.execute("UPDATE users SET status = 'verified' WHERE status = 'pending'"); } catch {}
  }

  const [rows] = await pool.execute('SELECT COUNT(*) as c FROM users');
  if (rows[0].c === 0) {
    const hashed = await bcrypt.hash('@Gr4ktung978', 10);
    await pool.execute("INSERT INTO users (username, name, email, password, status) VALUES (?, ?, ?, ?, 'verified')", ['admin', 'Admin', 'admin@stmonicayouth.app', hashed]);
  } else {
    try {
      await pool.execute(
        "UPDATE users SET status = 'verified', name = COALESCE(NULLIF(name, ''), 'Admin'), email = COALESCE(NULLIF(email, ''), 'admin@stmonicayouth.app') WHERE username = 'admin'"
      );
    } catch {}
  }

  const MEMBERS = [
    'Lucy Achieng Otieno', 'Michael Ndambuki', 'Magdalene Muthoni', 'Jessica Althachi', 'Shelmith Mbinya',
    'Britney Bowen', 'Susan Muthoni', 'Samara Komen', 'Shalyne Wambani', 'Edwin Otieno',
    'Stanley Ochieng', 'Florence Gatembei', 'Anne Ndunge', 'Chris Joseph', 'Cynthia Muthoni',
    'Maloba Victor', 'Deogracious Oduor', 'Ekalale Felix Lowet', 'Joel Roseno', 'Ann Mburu',
    'Annah Mugo', 'Zachariah Mutua', 'Augustine Ouma', 'Winfred Wanyiri', 'Julius Kangara',
    'Ann Nderi', 'Dickson Ishagi', 'Christina Ameda', 'Fridah Arwa', 'Wencyclous Ashimene',
    'Esther Virgil', 'Annrita Nderi', 'Anuarite Carol', 'John Martin', 'Nancy Thuri',
    'Vane Nyaboke', 'Ian Oyilo', "Ezekiel Ndung'u", 'Rosemary Gitau', 'Cecilia Wanjiru',
    'Gloria Mwende', 'Caroline Nderi', 'Allan Njuguna', 'Anne Wanjiru', 'Haxly Njoroge',
    'Anita Joan', 'Evaline Kioko', 'Elijah Otieno', 'Justin Oloo', 'Consolata Wanjiru',
    'Cynthia Njeri', 'Onesmus Kilonzo', 'Briton Munyao', 'Mark Majanga', 'Dennis NJau',
    'Willis Otieno', 'John Muthini', 'Meshack Waichanguru', 'Florian Maroko', 'Brian Gicheru',
    'Baron Maina', 'Vanessa Gathuri', 'Mary Njeri', 'Robbin', 'Joseph Oduor',
    'Michael Onyango', 'Florence Achieng', 'Sylvia Natalia', 'Joshua Odhiambo', 'John Robinson',
    'Jacinta Kamaisi', 'Francis Mwangi', 'Mike Mwirigi', 'Peter Nabea', 'Rahma Nunow',
    'Jacobeth Nafula', 'Samuel Mbao', 'Austine Masinde', 'Felister Ndanu', 'Mosmat Wesa',
    'Angelo Katembo', 'Eugine Aluoch', 'Tabitha Njeri', 'Agnes Nzou', 'Lindsey Lilian Wechuli',
    'Crispus Mutua', 'Levin Dan', 'Catherine Otema', 'Caroline Nduta', 'Sara Wavinya',
    "Constantine Ong'angi", 'Sarah Ndambuki', 'Sharon Otieno', 'Linet Njeri', 'Olive Carol',
    'Jackline', 'Immaculate Wanjiru', 'Hellen Wanjiku', 'Zipporah Koki',
  ];

  for (const fullName of MEMBERS) {
    try {
      await pool.execute(
        'INSERT INTO youth_members (full_name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM youth_members WHERE LOWER(full_name) = LOWER(?))',
        [fullName, fullName]
      );
    } catch {}
  }

  const INTERESTS = [
    ['football', 'Football', 'Sports'], ['basketball', 'Basketball', 'Sports'],
    ['volleyball', 'Volleyball', 'Sports'], ['athletics', 'Athletics', 'Sports'],
    ['swimming', 'Swimming', 'Sports'], ['tennis', 'Tennis', 'Sports'],
    ['cricket', 'Cricket', 'Sports'], ['martial-arts', 'Martial Arts', 'Sports'],
    ['music', 'Music', 'Arts'], ['drawing', 'Drawing', 'Arts'],
    ['painting', 'Painting', 'Arts'], ['photography', 'Photography', 'Arts'],
    ['dance', 'Dance', 'Arts'], ['drama', 'Drama / Theatre', 'Arts'],
    ['poetry', 'Poetry / Writing', 'Arts'], ['crafts', 'Crafts / DIY', 'Arts'],
    ['cooking', 'Cooking', 'Food'], ['baking', 'Baking', 'Food'],
    ['food-reviewing', 'Food Reviewing', 'Food'], ['grilling', 'Grilling / BBQ', 'Food'],
    ['gaming', 'Gaming', 'Gaming'], ['board-games', 'Board Games', 'Gaming'],
    ['chess', 'Chess', 'Gaming'], ['esports', 'Esports', 'Gaming'],
    ['reading', 'Reading', 'Learning'], ['science', 'Science', 'Learning'],
    ['tech', 'Technology', 'Learning'], ['languages', 'Languages', 'Learning'],
    ['history', 'History', 'Learning'], ['astronomy', 'Astronomy', 'Learning'],
    ['movies', 'Movies / Films', 'Entertainment'], ['anime', 'Anime / Manga', 'Entertainment'],
    ['podcasts', 'Podcasts', 'Entertainment'], ['youtube', 'YouTube / Streaming', 'Entertainment'],
    ['hiking', 'Hiking / Outdoors', 'Nature'], ['gardening', 'Gardening', 'Nature'],
    ['animals', 'Animals / Pets', 'Nature'], ['camping', 'Camping', 'Nature'],
    ['fashion', 'Fashion', 'Lifestyle'], ['travel', 'Travel', 'Lifestyle'],
    ['fitness', 'Fitness / Gym', 'Lifestyle'], ['yoga', 'Yoga / Meditation', 'Lifestyle'],
    ['collecting', 'Collecting (Cards/Coins)', 'Lifestyle'], ['volunteering', 'Volunteering', 'Lifestyle'],
    ['church', 'Church Ministry', 'Spiritual'], ['choir', 'Choir / Singing', 'Spiritual'],
    ['bible-study', 'Bible Study', 'Spiritual'], ['prayer', 'Prayer / Rosary', 'Spiritual'],
    ['fishing', 'Fishing', 'Hobbies'], ['carpentry', 'Carpentry / Woodwork', 'Hobbies'],
    ['coding', 'Coding / Programming', 'Hobbies'], ['knitting', 'Knitting / Sewing', 'Hobbies'],
    ['art', 'Art', 'Arts'], ['art-museums', 'Art Museums', 'Arts'],
    ['culture', 'Culture', 'Arts'],
    ['food', 'Food', 'Food'], ['foodie-culture', 'Foodie Culture', 'Food'],
    ['entertainment-music', 'Entertainment & Music', 'Entertainment'], ['documentaries', 'Documentaries', 'Entertainment'],
    ['sports-gaming', 'Sports Gaming', 'Gaming'], ['puzzles', 'Puzzles', 'Gaming'],
    ['adventure', 'Adventure', 'Nature'],
    ['walking', 'Walking', 'Hobbies'],
    ['wrestling', 'Wrestling', 'Sports'],
    ['calisthenics', 'Calisthenics', 'Lifestyle'], ['makeup-beauty', 'Makeup / Beauty', 'Lifestyle'],
    ['aesthetic-collecting', 'Aesthetic Collecting', 'Lifestyle'], ['doom-scrolling', 'Doom Scrolling', 'Lifestyle'],
    ['sleep', 'Sleep', 'Lifestyle'], ['hanging-out', 'Hanging Out with Friends', 'Lifestyle'],
    ['philosophy', 'Philosophy', 'Learning'], ['psychology', 'Psychology', 'Learning'],
    ['health', 'Health', 'Learning'], ['economics', 'Economics', 'Learning'],
    ['religious-history', 'Religious History', 'Learning'], ['political-history', 'Political History', 'Learning'],
    ['historical-culture', 'Historical Culture', 'Learning'], ['business-investment', 'Business & Investment', 'Learning'],
  ];

  for (const [slug, label, category] of INTERESTS) {
    try {
      await pool.execute(
        `INSERT INTO santa_interests (slug, label, category) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category)`,
        [slug, label, category]
      );
    } catch {}
  }

  return db;
}

export default db;
