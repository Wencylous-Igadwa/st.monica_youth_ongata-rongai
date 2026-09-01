import { Router } from 'express';
import db from '../db.js';

const router = Router();

const VALID_SECTIONS = ['events', 'gallery', 'spotlight', 'sports', 'leadership', 'families', 'programs', 'hof', 'football_squad'];
const DESC_SECTIONS = new Set(['events', 'gallery', 'spotlight', 'sports']);

const ROLE_RANK = {
  'chairperson': 1, 'vice chairperson': 2, 'vice': 2,
  'secretary': 3, 'assistant secretary': 4,
  'treasurer': 5, 'organizing secretary': 6, 'organising secretary': 6,
};

function sortByRole(items) {
  return items.sort((a, b) => {
    const ra = ROLE_RANK[a.role?.toLowerCase()] ?? 99;
    const rb = ROLE_RANK[b.role?.toLowerCase()] ?? 99;
    return ra - rb;
  });
}

function sectionTable(section) {
  if (!VALID_SECTIONS.includes(section)) return null;
  return section;
}

/* ─── KV STORE ─── */
const ALLOWED_STORE_KEYS = ['gallery_sphere', 'gallery_grid', 'football_stats', 'football_coach'];

router.get('/store/:key', async (req, res, next) => {
  if (!ALLOWED_STORE_KEYS.includes(req.params.key)) {
    return res.status(400).json({ error: 'Invalid store key' });
  }
  try {
    const row = await db.get('SELECT `value` FROM kv_store WHERE `key` = ?', [req.params.key]);
    const value = row ? JSON.parse(row.value) : null;
    res.json({ data: value });
  } catch { next(new Error('DB error')); }
});

router.put('/store/:key', async (req, res, next) => {
  if (!ALLOWED_STORE_KEYS.includes(req.params.key)) {
    return res.status(400).json({ error: 'Invalid store key' });
  }
  try {
    const value = JSON.stringify(req.body.data ?? []);
    await db.run(
      'INSERT INTO kv_store (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      [req.params.key, value, value]
    );
    res.json({ success: true, data: req.body.data ?? [] });
  } catch { next(new Error('DB error')); }
});

router.get('/:section', async (req, res, next) => {
  const table = sectionTable(req.params.section);
  if (!table) return res.status(400).json({ error: 'Invalid section' });

  const order = DESC_SECTIONS.has(table) ? 'DESC' : 'ASC';
  let rows;
  try {
    rows = await db.all(`SELECT * FROM ${table} ORDER BY id ${order}`);
  } catch (err) {
    return next(err);
  }
  if (table === 'leadership') sortByRole(rows);
  const parsed = rows.map(r => {
    for (const field of ['images', 'members', 'stats']) {
      if (r[field] && typeof r[field] === 'string') {
        try { r[field] = JSON.parse(r[field]); } catch { r[field] = field === 'stats' ? {} : []; }
      }
    }
    return r;
  });
  res.json({ data: parsed });
});

router.post('/:section', async (req, res) => {
  const table = sectionTable(req.params.section);
  if (!table) return res.status(400).json({ error: 'Invalid section' });

  const { id, ...body } = req.body;
  const itemId = id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6));

  if (table === 'events') {
    await db.run(`INSERT INTO events (id, title, date, time, location, status, duration, description, image, homepage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, body.title || '', body.date || '', body.time || '', body.location || '',
       body.status || 'upcoming', body.duration || 2, body.description || '', body.image || '',
       body.homepage ? 1 : 0]
    );
  } else if (table === 'gallery') {
    const images = Array.isArray(body.images) ? JSON.stringify(body.images) : (body.images || '[]');
    await db.run(`INSERT INTO gallery (id, title, meta, images) VALUES (?, ?, ?, ?)`,
      [itemId, body.title || '', body.meta || '', images]
    );
  } else if (table === 'spotlight') {
    await db.run(`INSERT INTO spotlight (id, type, event, date, title, subtitle, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [itemId, body.type || '', body.event || '', body.date || '', body.title || '', body.subtitle || '', body.image || '']
    );
  } else if (table === 'sports') {
    await db.run(`INSERT INTO sports (id, sport, competition, date, team1, team2, score1, score2, notes, notes2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, body.sport || 'football', body.competition || '', body.date || '',
       body.team1 || '', body.team2 || '', body.score1 || 0, body.score2 || 0, body.notes || '', body.notes2 || '']
    );
  } else if (table === 'leadership') {
    await db.run(`INSERT INTO leadership (id, name, role, initials, color, img, quote) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [itemId, body.name || '', body.role || '', body.initials || '', body.color || '', body.img || '', body.quote || '']
    );
  } else if (table === 'families') {
    const members = Array.isArray(body.members) ? JSON.stringify(body.members) : (body.members || '[]');
    await db.run(`INSERT INTO families (id, name, sub, color, members) VALUES (?, ?, ?, ?, ?)`,
      [itemId, body.name || '', body.sub || '', body.color || '', members]
    );
  } else if (table === 'programs') {
    await db.run(`INSERT INTO programs (id, title, \`desc\`, meta) VALUES (?, ?, ?, ?)`,
      [itemId, body.title || '', body.desc || '', body.meta || '']
    );
  } else if (table === 'hof') {
    await db.run(`INSERT INTO hof (id, icon, year, title, \`desc\`) VALUES (?, ?, ?, ?, ?)`,
      [itemId, body.icon || '', body.year || '', body.title || '', body.desc || '']
    );
  } else if (table === 'football_squad') {
    const stats = body.stats && typeof body.stats === 'object' ? JSON.stringify(body.stats) : (body.stats || '{}');
    await db.run(`INSERT INTO football_squad (id, name, num, label, \`group\`, x, y, color, img, position, rating, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, body.name || '', body.num ?? 0, body.label || '', body.group || '',
       body.x ?? 50, body.y ?? 50, body.color || '', body.img || '', body.position || '',
       body.rating ?? 50, stats]
    );
  }

  const item = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [itemId]);
  for (const field of ['images', 'members', 'stats']) {
    if (item && item[field] && typeof item[field] === 'string') {
      try { item[field] = JSON.parse(item[field]); } catch { item[field] = field === 'stats' ? {} : []; }
    }
  }
  res.status(201).json(item);
});

router.put('/:section/:id', async (req, res) => {
  const table = sectionTable(req.params.section);
  if (!table) return res.status(400).json({ error: 'Invalid section' });
  const { id: bodyId, ...body } = req.body;

  const existing = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  if (table === 'events') {
    await db.run(`UPDATE events SET title=?, date=?, time=?, location=?, status=?, duration=?, description=?, image=?, homepage=? WHERE id=?`,
      [body.title ?? existing.title, body.date ?? existing.date, body.time ?? existing.time,
       body.location ?? existing.location, body.status ?? existing.status,
       body.duration ?? existing.duration, body.description ?? existing.description,
       body.image ?? existing.image,
       body.homepage !== undefined ? (body.homepage ? 1 : 0) : (existing.homepage || 0),
       req.params.id]
    );
  } else if (table === 'gallery') {
    const images = body.images ? (Array.isArray(body.images) ? JSON.stringify(body.images) : body.images) : existing.images;
    await db.run(`UPDATE gallery SET title=?, meta=?, images=? WHERE id=?`,
      [body.title ?? existing.title, body.meta ?? existing.meta, images, req.params.id]
    );
  } else if (table === 'spotlight') {
    await db.run(`UPDATE spotlight SET type=?, event=?, date=?, title=?, subtitle=?, image=? WHERE id=?`,
      [body.type ?? existing.type, body.event ?? existing.event, body.date ?? existing.date,
       body.title ?? existing.title, body.subtitle ?? existing.subtitle,
       body.image ?? existing.image, req.params.id]
    );
  } else if (table === 'sports') {
    await db.run(`UPDATE sports SET sport=?, competition=?, date=?, team1=?, team2=?, score1=?, score2=?, notes=?, notes2=? WHERE id=?`,
      [body.sport ?? existing.sport, body.competition ?? existing.competition, body.date ?? existing.date,
       body.team1 ?? existing.team1, body.team2 ?? existing.team2,
       body.score1 ?? existing.score1, body.score2 ?? existing.score2,
       body.notes ?? existing.notes, body.notes2 ?? existing.notes2, req.params.id]
    );
  } else if (table === 'leadership') {
    await db.run(`UPDATE leadership SET name=?, role=?, initials=?, color=?, img=?, quote=? WHERE id=?`,
      [body.name ?? existing.name, body.role ?? existing.role, body.initials ?? existing.initials,
       body.color ?? existing.color, body.img ?? existing.img, body.quote ?? existing.quote,
       req.params.id]
    );
  } else if (table === 'families') {
    const members = body.members ? (Array.isArray(body.members) ? JSON.stringify(body.members) : body.members) : existing.members;
    await db.run(`UPDATE families SET name=?, sub=?, color=?, members=? WHERE id=?`,
      [body.name ?? existing.name, body.sub ?? existing.sub, body.color ?? existing.color, members, req.params.id]
    );
  } else if (table === 'programs') {
    await db.run(`UPDATE programs SET title=?, \`desc\`=?, meta=? WHERE id=?`,
      [body.title ?? existing.title, body.desc ?? existing.desc, body.meta ?? existing.meta, req.params.id]
    );
  } else if (table === 'hof') {
    await db.run(`UPDATE hof SET icon=?, year=?, title=?, \`desc\`=? WHERE id=?`,
      [body.icon ?? existing.icon, body.year ?? existing.year, body.title ?? existing.title, body.desc ?? existing.desc, req.params.id]
    );
  } else if (table === 'football_squad') {
    const stats = body.stats ? (typeof body.stats === 'object' ? JSON.stringify(body.stats) : body.stats) : existing.stats;
    await db.run(`UPDATE football_squad SET name=?, num=?, label=?, \`group\`=?, x=?, y=?, color=?, img=?, position=?, rating=?, stats=? WHERE id=?`,
      [body.name ?? existing.name, body.num ?? existing.num, body.label ?? existing.label,
       body.group ?? existing.group, body.x ?? existing.x, body.y ?? existing.y,
       body.color ?? existing.color, body.img ?? existing.img, body.position ?? existing.position,
       body.rating ?? existing.rating, stats, req.params.id]
    );
  }

  const item = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
  for (const field of ['images', 'members', 'stats']) {
    if (item && item[field] && typeof item[field] === 'string') {
      try { item[field] = JSON.parse(item[field]); } catch { item[field] = field === 'stats' ? {} : []; }
    }
  }
  res.json(item);
});

router.delete('/:section/:id', async (req, res) => {
  const table = sectionTable(req.params.section);
  if (!table) return res.status(400).json({ error: 'Invalid section' });

  const result = await db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;
