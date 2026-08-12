import nodemailer from 'nodemailer';
import 'dotenv/config';

function isConfigured() {
  return !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: (process.env.SMTP_SECURE || 'true') !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export function isMailConfigured() {
  return isConfigured();
}

export async function sendMail({ to, subject, text, html }) {
  if (!isConfigured()) {
    console.log(`[mailer] SMTP not configured. Email not sent to ${to}.`);
    return { skipped: true };
  }

  const from = {
    name: process.env.MAIL_FROM_NAME || 'St.Monica Youth Ongata Rongai',
    address: process.env.SMTP_FROM || process.env.SMTP_USER,
  };

  try {
    await getTransporter().sendMail({ from, to, subject, text, html });
    return { ok: true };
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
    return { ok: false, error: err.message };
  }
}
