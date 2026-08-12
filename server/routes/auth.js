import { Router } from 'express';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { sendMail } from '../mailer.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'st-monica-parish-secret-2025';
const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (nb.length >= 3 && na.includes(nb) && na.length - nb.length <= 2) return true;
  if (na.length >= 3 && nb.includes(na) && nb.length - na.length <= 2) return true;
  return false;
}

function generateCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0');
}

async function findMember(name) {
  const members = await db.all('SELECT full_name FROM youth_members');
  return members.find(m => namesMatch(name, m.full_name)) || null;
}

async function existingUserByName(name) {
  const users = await db.all('SELECT id, name FROM users');
  return users.find(u => namesMatch(name, u.name)) || null;
}

async function invalidateOldCodes(userId) {
  await db.run("UPDATE verification_codes SET used = 1 WHERE user_id = ? AND used = 0", [userId]);
}

async function createVerificationCode(userId) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
  await db.run(
    'INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
    [userId, code, expiresAt]
  );
  return code;
}

async function emailVerificationCode(user, code) {
  const subject = 'Your St. Monica Youth Registration Code';
  const text = [
    `Hello ${user.name},`,
    '',
    `Thank you for registering with St. Monica Youth Ongata Rongai.`,
    `Your registration verification code is: ${code}`,
    '',
    `Enter this code on the verification page to activate your account.`,
    `The code expires in ${CODE_TTL_MINUTES} minutes.`,
    '',
    'If you did not register on our website, you can ignore this email.',
    '',
    'St. Monica Youth Ongata Rongai',
  ].join('\n');
  const html = `
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
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2c2416;margin:0 0 8px;">Verify Your Account</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b5d4a;line-height:1.6;margin:0 0 20px;">
                    Hello <strong style="color:#2c2416;">${user.name}</strong>,<br>
                    Thank you for registering with St. Monica Youth Ongata Rongai.<br>
                    Enter the code below to activate your account.
                  </div>
                  <div style="background:#ffffff;border:2px dashed #c8963e;border-radius:10px;padding:18px 16px;margin:0 0 20px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a8b78;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:6px;">Your Verification Code</div>
                    <div style="font-family:'Courier New',monospace;font-size:34px;font-weight:bold;color:#c8963e;letter-spacing:10px;line-height:1;">${code}</div>
                  </div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b5d4a;line-height:1.6;margin:0 0 22px;">
                    This code expires in <strong style="color:#a67a2e;">${CODE_TTL_MINUTES} minutes</strong>.
                    If you did not register on our website, you can safely ignore this email.
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
  console.log(`[auth] Verification code for ${user.email}: ${code}`);
  return sendMail({ to: user.email, subject, text, html });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const dupByName = await existingUserByName(name);
    if (dupByName) {
      return res.status(409).json({ error: 'This name already has a registered account. If this is you, please log in or use the verification code sent to your email.' });
    }

    const member = await findMember(name);
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, status, is_member) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashed, 'pending', member ? 1 : 0]
    );
    const userId = result.insertId;
    const user = { id: userId, name: name.trim(), email: cleanEmail };

    if (member) {
      const code = await createVerificationCode(userId);
      const mailResult = await emailVerificationCode(user, code);
      if (mailResult && mailResult.ok === false) {
        await db.run('DELETE FROM users WHERE id = ?', [userId]);
        return res.status(500).json({ error: 'We could not send the verification email. Please try again in a moment.' });
      }
      return res.status(201).json({ requiresVerification: true, status: 'code_sent', email: cleanEmail });
    }

    return res.status(201).json({
      requiresVerification: false,
      status: 'pending',
      email: cleanEmail,
      message: 'Thank you for registering with St. Monica Youth. Your account is pending approval by our admin. You will be able to log in once it is approved.',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) return res.status(400).json({ error: 'No account found for this email' });
    if (user.status === 'verified') {
      return res.status(400).json({ error: 'This account is already verified. You can log in.' });
    }
    if (user.status === 'denied') {
      return res.status(403).json({ error: 'Your registration was not approved. Please contact the admin.' });
    }

    const record = await db.get(
      'SELECT * FROM verification_codes WHERE user_id = ? AND used = 0 ORDER BY id DESC LIMIT 1',
      [user.id]
    );
    if (!record) {
      return res.status(400).json({ error: 'No active verification code found. Please request a new code.' });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Your code has expired. Please request a new code.' });
    }
    if (record.code !== String(code).trim()) {
      const attempts = record.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await db.run('UPDATE verification_codes SET used = 1, attempts = ? WHERE id = ?', [attempts, record.id]);
        return res.status(400).json({ error: 'Too many failed attempts. Please request a new code.' });
      }
      await db.run('UPDATE verification_codes SET attempts = ? WHERE id = ?', [attempts, record.id]);
      return res.status(400).json({ error: 'Invalid code. Please check and try again.' });
    }

    await db.run('UPDATE verification_codes SET used = 1 WHERE id = ?', [record.id]);
    await db.run("UPDATE users SET status = 'verified', verified_at = NOW() WHERE id = ?", [user.id]);

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) return res.status(400).json({ error: 'No account found for this email' });
    if (user.status === 'verified') {
      return res.status(400).json({ error: 'This account is already verified. You can log in.' });
    }
    if (user.status === 'denied') {
      return res.status(403).json({ error: 'Your registration was not approved. Please contact the admin.' });
    }

    await invalidateOldCodes(user.id);
    const code = await createVerificationCode(user.id);
    const mailResult = await emailVerificationCode(user, code);
    if (mailResult && mailResult.ok === false) {
      return res.status(500).json({ error: 'We could not send the verification email. Please try again in a moment.' });
    }
    res.json({ ok: true, status: 'code_sent', email: user.email });
  } catch (err) {
    console.error('Resend code error:', err);
    res.status(500).json({ error: 'Could not resend the code. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', [identifier, identifier]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.status === 'pending') {
      if (user.is_member) {
        return res.status(403).json({ error: 'Please verify your email first. A verification code was sent to your inbox, or use the "Resend code" option.' });
      }
      return res.status(403).json({ error: 'Your registration is still pending approval by our admin. Please check back soon.' });
    }
    if (user.status === 'denied') {
      return res.status(403).json({ error: 'Your registration was not approved. Please contact the admin.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [payload.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
export { JWT_SECRET, normalizeName, namesMatch };
