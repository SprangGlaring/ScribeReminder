// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const db = new Database('db.sqlite');
db.exec(`CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY, data TEXT
)`);

const app = express();
app.use(bodyParser.json());

// simple basic sync endpoint: client posts full list, server stores per-id
app.post('/sync', (req, res) => {
  const list = req.body.subs;
  if (!Array.isArray(list)) return res.status(400).send('invalid');
  const insert = db.prepare('INSERT OR REPLACE INTO subscriptions (id, data) VALUES (?,?)');
  const tx = db.transaction((items) => {
    items.forEach(s => insert.run(s.id, JSON.stringify(s)));
  });
  tx(list);
  res.json({ ok: true });
});

// get all (for a single user demo this returns everything)
app.get('/sync', (req, res) => {
  const rows = db.prepare('SELECT data FROM subscriptions').all();
  const subs = rows.map(r => JSON.parse(r.data));
  res.json({ subs });
});

// --- Example mailer: you must configure SMTP env vars ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function checkAndSendReminders() {
  const rows = db.prepare('SELECT data FROM subscriptions').all();
  const today = new Date();
  rows.forEach(r => {
    const s = JSON.parse(r.data);
    // naive: if nextDate within 3 days send mail (adjust logic for production)
    const nextDate = new Date(s.nextDate || s.startDate);
    const diff = (nextDate - today) / (1000*60*60*24);
    if (diff <= 3) {
      // send mail to configured admin address
      const mail = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO,
        subject: `订阅提醒：${s.name} 将在 ${s.nextDate || s.startDate} 到期`,
        text: `服务: ${s.name}\n到期: ${s.nextDate || s.startDate}\n费用: ${s.amount} ${s.currency}\n备注: ${s.notes || ''}`
      };
      transporter.sendMail(mail).catch(console.error);
    }
  });
}

// cron job runs every day at 8:00
cron.schedule('0 8 * * *', checkAndSendReminders);

app.listen(3000, () => console.log('Server running on :3000'));
