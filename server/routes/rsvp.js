import { Router } from 'express';
import PDFDocument from 'pdfkit';
import db from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { event_id, event_title, name, phone } = req.body;
  if (!event_id || !name || !phone) {
    return res.status(400).json({ error: 'event_id, name, and phone are required' });
  }
  const result = await db.run(
    `INSERT INTO rsvps (event_id, event_title, name, phone) VALUES (?, ?, ?, ?)`,
    [event_id, event_title || '', name, phone]
  );
  const rsvp = await db.get('SELECT * FROM rsvps WHERE id = ?', [result.insertId]);
  res.status(201).json(rsvp);
});

router.use((req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

router.get('/:eventId', async (req, res) => {
  const rows = await db.all('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at DESC', [req.params.eventId]);
  res.json({ data: rows });
});

router.get('/:eventId/pdf', async (req, res) => {
  const rows = await db.all('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at ASC', [req.params.eventId]);
  const event = await db.get('SELECT title FROM events WHERE id = ?', [req.params.eventId]);
  const eventTitle = event ? event.title : (rows.length > 0 ? rows[0].event_title : 'Event');
  const safeName = eventTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ').trim() || 'Attendance List';

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName} - Attendance List.pdf"`);
  doc.pipe(res);

  const GOLD = '#b8860b';
  const DARK = '#2c2416';
  const MUTED = '#6b5d4a';
  const pageWidth = doc.page.width - 100;

  doc.rect(0, 0, doc.page.width, 120).fill('#faf6f0');

  doc.save();
  doc.translate(doc.page.width / 2, 55);
  doc.lineWidth(2.5);
  doc.strokeColor(GOLD);
  const cs = 9;
  doc.moveTo(0, -cs).lineTo(0, cs).stroke();
  doc.moveTo(-cs * 0.65, -cs * 0.3).lineTo(cs * 0.65, -cs * 0.3).stroke();
  doc.moveTo(-cs * 0.65, cs * 0.3).lineTo(cs * 0.65, cs * 0.3).stroke();
  doc.restore();

  doc.fontSize(22).font('Helvetica-Bold').fillColor(DARK).text('St. Monica Catholic Youth Parish', 50, 65, { align: 'center', width: pageWidth, characterSpacing: 1 });
  doc.fontSize(11).font('Helvetica').fillColor(MUTED).text('Faith  \u00b7  Hope  \u00b7  Love', 50, 92, { align: 'center', width: pageWidth });
  doc.rect(50, 120, pageWidth, 2).fill(GOLD);

  doc.fontSize(16).font('Helvetica-Bold').fillColor(DARK).text('Attendance List', 50, 150, { align: 'center', width: pageWidth });
  doc.fontSize(13).font('Helvetica').fillColor(MUTED).text(eventTitle, 50, 165, { align: 'center', width: pageWidth });
  if (rows.length === 0) {
    doc.fontSize(12).font('Helvetica').fillColor(MUTED).text('No attendees registered yet.', 50, 230, { align: 'center', width: pageWidth });
  } else {
    doc.fontSize(10).fillColor(MUTED).text(`Total Attendees: ${rows.length}`, 50, 218, { align: 'right', width: pageWidth });

    const tableTop = 240;
    const colX = [50, 60, 320, 460];
    const colW = [10, 260, 140, 100];
    const headers = ['#', 'Name', 'Phone', 'Registered'];

    doc.rect(50, tableTop - 4, pageWidth, 22).fill('#f0e8d8');
    doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK);
    headers.forEach((h, i) => {
      doc.text(h, colX[i], tableTop, { width: colW[i], align: i === 0 ? 'center' : 'left' });
    });
    doc.rect(50, tableTop + 18, pageWidth, 1).fill(GOLD);

    let y = tableTop + 28;
    rows.forEach((row, i) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }
      if (i % 2 === 0) {
        doc.rect(50, y - 4, pageWidth, 20).fill('#faf6f0');
      }
      doc.font('Helvetica').fontSize(10).fillColor(DARK);
      doc.text(String(i + 1), colX[0], y, { width: colW[0], align: 'center' });
      doc.text(row.name, colX[1], y, { width: colW[1] });
      doc.text(row.phone, colX[2], y, { width: colW[2] });
      doc.text(row.created_at ? row.created_at.toString().slice(0, 10) : '-', colX[3], y, { width: colW[3] });
      y += 22;
    });
  }

  doc.rect(50, doc.page.height - 70, pageWidth, 1).fill(GOLD);
  doc.fontSize(8).font('Helvetica').fillColor('#bbb').text('St. Monica Catholic Youth Parish  \u00b7  Generated automatically', 50, doc.page.height - 55, { align: 'center', width: pageWidth });

  doc.end();
});

export default router;
