import { Router } from 'express';
import multer from 'multer';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, '..', 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;
    if (allowed.test(extname(file.originalname))) return cb(null, true);
    cb(new Error('File type not supported'), false);
  },
});

const router = Router();

router.post('/upload', upload.array('file', 20), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files provided' });
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls }); // was { url } — aligned with array response
});

router.get('/uploads', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (!existsSync(uploadDir)) return res.json({ data: [] });
    const files = readdirSync(uploadDir)
      .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
      .map(f => ({
        name: f,
        url: `/uploads/${f}`,
        uploadedAt: statSync(join(uploadDir, f)).mtime,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json({ data: files });
  } catch {
    res.status(500).json({ error: 'Failed to list uploads' });
  }
});

export default router;
