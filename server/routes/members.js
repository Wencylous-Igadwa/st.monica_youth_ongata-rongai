import { Router } from 'express';
import db from '../db.js';
import { sendMail } from '../mailer.js';

const router = Router();

function approvedEmailHtml({ name, email, loginUrl }) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#faf6f0;">
    <div style="background-color:#faf6f0;padding:32px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
              <tr>
                <td align="center" style="padding:0 0 20px;">
                  <div style="font-family:Georgia,'Times New Roman',serif;color:#c8963e;font-size:40px;line-height:1;">&#10013;</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#2c2416;letter-spacing:0.04em;">St. Monica <span style="color:#c8963e;">Youth</span></div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9a8b78;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Ongata Rongai</div>
                </td>
              </tr>
              <tr>
                <td align="center" style="background:linear-gradient(145deg,#fdfcfa,#ede4d5);border:1px solid rgba(44,36,22,0.12);border-radius:16px;padding:36px 28px;">
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2c2416;margin:0 0 8px;">You&rsquo;ve Been Verified! &#10004;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b5d4a;line-height:1.6;margin:0 0 20px;">
                    Hello <strong style="color:#2c2416;">${name}</strong>,<br>
                    Great news! Your registration with <strong style="color:#c8963e;">St. Monica Youth Ongata Rongai</strong>
                    has been verified and approved by our admin.
                  </div>
                  <div style="background:#ffffff;border:2px solid #c8963e;border-radius:10px;padding:18px 16px;margin:0 0 22px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a8b78;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:8px;">Log in with your email &amp; password</div>
                    <div style="font-family:'Courier New',monospace;font-size:16px;color:#2c2416;word-break:break-all;">${email}</div>
                  </div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b5d4a;line-height:1.6;margin:0 0 24px;">
                    You can now log in to the website and enjoy all the programs, events, and updates.
                  </div>
                  <div style="margin:0 0 24px;">
                    <a href="${loginUrl}" style="font-family:Arial,Helvetica,sans-serif;display:inline-block;background-color:#c8963e;color:#fdfcfa;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 34px;border-radius:8px;">Log In to the Website</a>
                  </div>
                  <div style="border-top:1px solid rgba(44,36,22,0.1);padding-top:18px;">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#c8963e;">&#10013;</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9a8b78;line-height:1.6;">
                      St. Monica Catholic Youth Parish<br>
                      Ongata Rongai &middot; Nairobi, Kenya
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

async function isAdmin(req) {
  if (!req.user || !req.user.id) return false;
  const user = await db.get('SELECT id, username FROM users WHERE id = ?', [req.user.id]);
  return !!user && user.username === 'admin';
}

async function requireAdmin(req, res, next) {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

router.get('/members', requireAdmin, async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, name, email, username, status, is_member, verified_at, created_at FROM users ORDER BY created_at DESC'
    );
    const memberRows = await db.all('SELECT id, full_name FROM youth_members ORDER BY full_name ASC');
    const memberNames = memberRows.map(r => ({ id: r.id, full_name: r.full_name }));
    res.json({ users, memberNames });
  } catch (err) {
    console.error('List members error:', err);
    res.status(500).json({ error: 'Failed to load members' });
  }
});

router.post('/members/:id/approve', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const existing = await db.get('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    await db.run("UPDATE users SET status = 'verified', verified_at = COALESCE(verified_at, NOW()) WHERE id = ?", [userId]);

    if (existing.email) {
      const loginUrl = `${req.protocol}://${req.get('host')}/login`;
      const subject = 'You are now verified on St. Monica Youth Ongata Rongai';
      const text = [
        `Hello ${existing.name},`,
        '',
        'Great news! Your registration with St. Monica Youth Ongata Rongai has been verified and approved.',
        `You can now log in with your email (${existing.email}) and password:`,
        loginUrl,
        '',
        'St. Monica Youth Ongata Rongai',
      ].join('\n');
      try {
        const mailResult = await sendMail({ to: existing.email, subject, text, html: approvedEmailHtml({ name: existing.name, email: existing.email, loginUrl }) });
        if (mailResult && mailResult.ok === false) console.error('[members] Approval email failed to send:', mailResult.error);
      } catch (mailErr) {
        console.error('[members] Approval email error:', mailErr);
      }
    }

    res.json({ success: true, id: userId });
  } catch (err) {
    console.error('Approve member error:', err);
    res.status(500).json({ error: 'Failed to approve member' });
  }
});

router.post('/members/:id/deny', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const existing = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    await db.run("UPDATE users SET status = 'denied' WHERE id = ?", [userId]);
    res.json({ success: true, id: userId });
  } catch (err) {
    console.error('Deny member error:', err);
    res.status(500).json({ error: 'Failed to deny member' });
  }
});

router.post('/members/names', requireAdmin, async (req, res) => {
  try {
    const fullName = String(req.body.name || '').trim();
    if (!fullName) return res.status(400).json({ error: 'Name is required' });
    const existing = await db.get('SELECT id FROM youth_members WHERE full_name = ?', [fullName]);
    if (existing) return res.status(409).json({ error: 'This name is already on the member list' });
    const result = await db.run('INSERT INTO youth_members (full_name) VALUES (?)', [fullName]);
    res.status(201).json({ success: true, id: result.insertId, full_name: fullName });
  } catch (err) {
    console.error('Add member name error:', err);
    res.status(500).json({ error: 'Failed to add member name' });
  }
});

router.delete('/members/names/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const result = await db.run('DELETE FROM youth_members WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Member name not found' });
    res.json({ success: true, id });
  } catch (err) {
    console.error('Remove member name error:', err);
    res.status(500).json({ error: 'Failed to remove member name' });
  }
});

export default router;
