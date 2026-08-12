import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'st-monica-parish-secret-2025';

function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      return jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch {}
  }
  return null;
}

router.post('/scores', async (req, res) => {
  try {
    const { name, score, total, percentage } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ error: 'name and score are required' });
    }

    const user = getUserFromToken(req);
    const userId = user ? user.id : null;

    const result = await db.run(
      'INSERT INTO trivia_leaderboard (user_id, name, score, total, percentage) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), score, total || 100, percentage || 0]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Score submit error:', err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

router.get('/scores', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const rows = await db.all(
      'SELECT id, name, score, total, percentage, created_at FROM trivia_leaderboard ORDER BY score DESC, created_at ASC LIMIT ?',
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
