import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

import authRouter, { JWT_SECRET } from './routes/auth.js';
import crudRouter from './routes/crud.js';
import uploadRouter from './routes/upload.js';
import rsvpRouter from './routes/rsvp.js';
import leaderboardRouter from './routes/leaderboard.js';
import santaRouter from './routes/santa.js';
import membersRouter from './routes/members.js';
import { initDb } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
const PORT = process.env.PORT || 3001;

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/uploads', express.static(join(__dirname, 'uploads')));

  app.use('/api', authRouter);

  app.use('/api', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        req.user = jwt.verify(token, JWT_SECRET);
      } catch {}
    }
    next();
  });

  app.use('/api', uploadRouter);

  app.use('/api/rsvp', rsvpRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api', santaRouter);

  app.use('/api/admin', membersRouter);

  app.use('/api', (req, res, next) => {
    if (req.method === 'GET') return next();
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  });

  app.use('/api', crudRouter);

  app.use((err, req, res, next) => {
    console.error(err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 10MB)' });
    if (err.message === 'File type not supported') return res.status(415).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  (async () => {
    try {
      await initDb();
      const app = createApp();

      const distDir = join(__dirname, '..', 'dist');
      if (existsSync(distDir)) {
        app.use(express.static(distDir));

        const PAGE_MAP = {
          '/events': 'events.html',
          '/gallery': 'gallery.html',
          '/photos': 'gallery.html',
          '/community': 'community.html',
          '/trivia': 'trivia.html',
          '/spotlight': 'spotlight.html',
          '/register': 'auth.html',
          '/login': 'auth.html',
          '/verify': 'verify.html',
          '/s3s4m3': 's3s4m3.html',
          '/santa-profile': 'santa-profile.html',
          '/santa-users': 'santa-users.html',
          '/profile': 'profile.html',
        };

        app.get('/admin', (req, res) => res.redirect('/s3s4m3'));

        for (const [path, file] of Object.entries(PAGE_MAP)) {
          app.get(path, (req, res) => res.sendFile(join(distDir, file)));
        }

        app.get('*', (req, res) => {
          if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return;
          res.sendFile(join(distDir, 'index.html'));
        });
      }

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        if (existsSync(distDir)) console.log('Serving built frontend from dist/');
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  })();
}
