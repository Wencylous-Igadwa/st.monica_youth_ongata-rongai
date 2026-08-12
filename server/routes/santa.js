import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'st-monica-parish-secret-2025';

const ROSTER_ADMIN_USERNAME = process.env.ROSTER_ADMIN_USERNAME || 'gr4ktung';
const ROSTER_ADMIN_PASSWORD = process.env.ROSTER_ADMIN_PASSWORD || 'b4ckd00r69';

function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      return jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch {}
  }
  return null;
}

function requireAuth(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.user = user;
  next();
}

const ADJECTIVES = [
  'Cosmic', 'Velvet', 'Golden', 'Silver', 'Mystic', 'Crystal', 'Frozen',
  'Happy', 'Lucky', 'Brave', 'Swift', 'Wild', 'Gentle', 'Fierce', 'Sly',
  'Noble', 'Clever', 'Bold', 'Calm', 'Bright', 'Cheerful', 'Daring',
  'Eager', 'Feisty', 'Gleeful', 'Humble', 'Jolly', 'Keen', 'Lively',
  'Merry', 'Playful', 'Quick', 'Radiant', 'Spirited', 'Tender', 'Vivid',
  'Witty', 'Young', 'Zealous', 'Ambitious', 'Blissful', 'Charming',
  'Dreamy', 'Enchanted', 'Fluttering', 'Gallant', 'Honest', 'Innocent',
];

const NOUNS = [
  'Panda', 'Fox', 'Owl', 'Bear', 'Wolf', 'Eagle', 'Dolphin', 'Tiger',
  'Hawk', 'Rabbit', 'Lion', 'Penguin', 'Koala', 'Deer', 'Falcon',
  'Cat', 'Dog', 'Parrot', 'Turtle', 'Otter', 'Whale', 'Seal', 'Puma',
  'Crane', 'Chameleon', 'Puppy', 'Kitten', 'Fawn', 'Cub', 'Lamb',
  'Robin', 'Finch', 'Sparrow', 'Wren', 'Magpie', 'Starling', 'Swan',
  'Dove', 'Phoenix', 'Dragon', 'Unicorn', 'Pegasus', 'Griffin',
  'Hummingbird', 'Butterfly', 'Ladybug', 'Firefly', 'Starfish',
];

function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

function parseInterests(interests) {
  if (Array.isArray(interests)) return interests;
  try { return JSON.parse(interests || '[]'); } catch { return []; }
}

function sharedInterestCount(a, b) {
  const aInterests = parseInterests(a);
  const bInterests = parseInterests(b);
  return aInterests.filter(x => bInterests.includes(x)).length;
}

async function runMatching() {
  const profiles = await db.all('SELECT id, user_id, interests FROM santa_profiles ORDER BY id ASC');
  const n = profiles.length;

  await db.run('DELETE FROM santa_matches');
  if (n < 2) return { matched: 0, unmatched: n, total: n };

  const score = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const shared = sharedInterestCount(profiles[i].interests, profiles[j].interests);
      score[i][j] = shared;
      score[j][i] = shared;
    }
  }

  const partner = Array(n).fill(-1);

  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push({ i, j, score: score[i][j] });
    }
  }
  pairs.sort((a, b) => b.score - a.score || a.i - b.i || a.j - b.j);

  for (const p of pairs) {
    if (partner[p.i] === -1 && partner[p.j] === -1) {
      partner[p.i] = p.j;
      partner[p.j] = p.i;
    }
  }

  let improved = true;
  let rounds = 0;
  while (improved && rounds++ < 100) {
    improved = false;
    for (let i = 0; i < n; i++) {
      const b = partner[i];
      if (b === -1 || b < i) continue;
      for (let j = i + 1; j < n; j++) {
        if (j === b) continue;
        const d = partner[j];
        if (d === -1 || d < j) continue;
        const a = i;
        const c = j;
        const cur = score[a][b] + score[c][d];
        const opt1 = score[a][c] + score[b][d];
        const opt2 = score[a][d] + score[b][c];
        const best = Math.max(cur, opt1, opt2);
        if (best > cur) {
          if (opt1 === best) {
            partner[a] = c; partner[c] = a;
            partner[b] = d; partner[d] = b;
          } else {
            partner[a] = d; partner[d] = a;
            partner[b] = c; partner[c] = b;
          }
          improved = true;
          break;
        }
      }
    }
  }

  let matchedUsers = 0;
  for (let i = 0; i < n; i++) {
    const j = partner[i];
    if (j === -1 || j < i) continue;
    matchedUsers += 2;
    await db.run(
      'INSERT INTO santa_matches (santa_user_id, recipient_user_id) VALUES (?, ?)',
      [profiles[i].user_id, profiles[j].user_id]
    );
    await db.run(
      'INSERT INTO santa_matches (santa_user_id, recipient_user_id) VALUES (?, ?)',
      [profiles[j].user_id, profiles[i].user_id]
    );
  }

  return { matched: matchedUsers, unmatched: n - matchedUsers, total: n };
}

router.get('/santa/interests', async (_req, res) => {
  try {
    const rows = await db.all('SELECT id, slug, label, category FROM santa_interests ORDER BY category, label');
    res.json({ data: rows });
  } catch (err) {
    console.error('Fetch interests error:', err);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

router.get('/santa/profile', requireAuth, async (req, res) => {
  try {
    const profile = await db.get(
      'SELECT id, user_id, username, interests, description, created_at FROM santa_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ profile: profile || null });
  } catch (err) {
    console.error('Fetch santa profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/santa/profile', requireAuth, async (req, res) => {
  try {
    const { interests, description } = req.body;
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'Select at least one interest' });
    }

    const existing = await db.get('SELECT id, username FROM santa_profiles WHERE user_id = ?', [req.user.id]);

    if (existing) {
      await db.run(
        'UPDATE santa_profiles SET interests = ?, description = ? WHERE user_id = ?',
        [JSON.stringify(interests), (description || '').trim(), req.user.id]
      );
      await runMatching();
      return res.json({ profile: { id: existing.id, username: existing.username, interests, description } });
    }

    let username;
    let attempts = 0;
    do {
      username = generateUsername();
      attempts++;
    } while (attempts < 20);

    const result = await db.run(
      'INSERT INTO santa_profiles (user_id, username, interests, description) VALUES (?, ?, ?, ?)',
      [req.user.id, username, JSON.stringify(interests), (description || '').trim()]
    );

    await runMatching();

    res.status(201).json({ profile: { id: result.insertId, username, interests, description } });
  } catch (err) {
    console.error('Save santa profile error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

router.put('/santa/profile/username', requireAuth, async (req, res) => {
  try {
    const existing = await db.get('SELECT id FROM santa_profiles WHERE user_id = ?', [req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Create a profile first' });
    }

    let username;
    let attempts = 0;
    do {
      username = generateUsername();
      attempts++;
    } while (attempts < 20);

    await db.run('UPDATE santa_profiles SET username = ? WHERE user_id = ?', [username, req.user.id]);
    res.json({ username });
  } catch (err) {
    console.error('Regenerate username error:', err);
    res.status(500).json({ error: 'Failed to regenerate username' });
  }
});

router.post('/santa/match', requireAuth, async (req, res) => {
  try {
    const profiles = await db.all('SELECT user_id, interests FROM santa_profiles');
    if (profiles.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 profiles to match' });
    }

    const result = await runMatching();
    res.json(result);
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'Failed to run matching' });
  }
});

router.get('/santa/match/me', requireAuth, async (req, res) => {
  try {
    const match = await db.get(
      `SELECT sm.recipient_user_id, sp.username, sp.interests, sp.description
       FROM santa_matches sm
       JOIN santa_profiles sp ON sp.user_id = sm.recipient_user_id
       WHERE sm.santa_user_id = ?`,
      [req.user.id]
    );

    if (!match) return res.json({ match: null });

    const interestSlugs = parseInterests(match.interests);
    const interestRows = interestSlugs.length > 0
      ? await db.all(`SELECT slug, label, category FROM santa_interests WHERE slug IN (${interestSlugs.map(() => '?').join(',')})`, interestSlugs)
      : [];

    res.json({
      match: {
        recipientUsername: match.username,
        interests: interestRows,
        description: match.description,
      },
    });
  } catch (err) {
    console.error('Fetch match error:', err);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

router.get('/santa/profiles', requireAuth, async (req, res) => {
  try {
    const profiles = await db.all(
      `SELECT sp.username, sp.interests, sp.description, u.name
       FROM santa_profiles sp
       JOIN users u ON u.id = sp.user_id
       ORDER BY sp.created_at ASC`
    );
    res.json({ data: profiles });
  } catch (err) {
    console.error('Fetch profiles error:', err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

router.post('/santa/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ROSTER_ADMIN_USERNAME && password === ROSTER_ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'roster-admin', name: username }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

router.get('/santa/users', async (req, res) => {
  try {
    const auth = getUserFromToken(req);
    if (!auth || auth.role !== 'roster-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const rows = await db.all(
      `SELECT u.name, u.email, sp.username AS santa_username, sp.interests, sp.description,
              u.created_at, sp.created_at AS santa_created_at,
              sm.recipient_user_id, r.name AS recipient_name,
              rsp.username AS recipient_santa_username, sm.matched_at
       FROM users u
       LEFT JOIN santa_profiles sp ON sp.user_id = u.id
       LEFT JOIN santa_matches sm ON sm.santa_user_id = u.id
       LEFT JOIN users r ON r.id = sm.recipient_user_id
       LEFT JOIN santa_profiles rsp ON rsp.user_id = sm.recipient_user_id
       WHERE u.email <> 'admin@stmonicayouth.app'
         AND u.email <> ''
       ORDER BY u.created_at ASC`
    );

    const slugRows = await db.all('SELECT slug, label FROM santa_interests');
    const labelBySlug = {};
    for (const r of slugRows) labelBySlug[r.slug] = r.label;

    const data = rows.map(r => ({
      name: r.name,
      email: r.email,
      santaUsername: r.santa_username || null,
      interests: parseInterests(r.interests).map(slug => labelBySlug[slug] || slug),
      description: r.description || '',
      registeredAt: r.created_at,
      santaCreatedAt: r.santa_created_at || null,
      santaFor: r.recipient_user_id
        ? {
            name: r.recipient_name || '—',
            santaUsername: r.recipient_santa_username || null,
            matchedAt: r.matched_at || null,
          }
        : null,
    }));

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('Fetch santa users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
