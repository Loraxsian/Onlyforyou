const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'subscriptions.json');

// Validasi & Konfigurasi Web Push VAPID
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@onlyforjessica.my.id',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('[WARN] VAPID keys belum diatur dengan benar di .env');
}

// Inisialisasi file penyimpanan langganan Web Push
if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2));
}

// Konfigurasi CORS
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN || 'https://onlyforjessica.my.id',
  'https://onlyforjessica.my.id',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti curl atau tools backend) atau domain terdaftar
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(null, true); // Tetap fleksibel untuk subdomain jika diperlukan
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Helper: Kirim Pesan ke Telegram
async function sendTelegramAlert(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Token atau Chat ID belum diset.');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    const result = await res.json();
    if (!result.ok) {
      console.error('[Telegram Error]', result);
    }
  } catch (err) {
    console.error('[Telegram Request Error]', err.message);
  }
}

// Status Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Jessica Surprise Notification Backend'
  });
});

// 1. ENDPOINT: Log Aktivitas PIN (Masuk / Salah)
app.post('/api/log-pin', async (req, res) => {
  try {
    const { pin, status, time, userAgent } = req.body;
    const clientIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip;

    const isSuccess = status === 'SUCCESS';
    const statusIcon = isSuccess ? '🎉 <b>BERHASIL MASUK!</b>' : '⚠️ <b>Percobaan PIN Salah</b>';
    const formattedTime = time || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    const message = [
      `🔔 <b>Aktivitas Pengunjung Website</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Status: ${statusIcon}`,
      `PIN diketik: <code>${pin || '-'}</code>`,
      `Waktu: <b>${formattedTime} WIB</b>`,
      `IP: <code>${clientIp}</code>`,
      `Perangkat: <i>${(userAgent || 'Tidak diketahui').slice(0, 120)}</i>`,
      `━━━━━━━━━━━━━━━━━━`
    ].join('\n');

    // Kirim notif ke Telegram tanpa membuat response frontend menunggu
    sendTelegramAlert(message);

    res.json({ ok: true, status: 'logged' });
  } catch (error) {
    console.error('Error in /api/log-pin:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 2. ENDPOINT: Menerima Pendaftaran Web Push dari Browser Jessica
app.post('/api/subscribe', (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ ok: false, error: 'Format langganan tidak valid.' });
    }

    const data = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
    const isExist = data.some((sub) => sub.endpoint === subscription.endpoint);

    if (!isExist) {
      data.push(subscription);
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(data, null, 2));

      // Beri notif ke pembuat bahwa Jessica bersedia menerima notif!
      const notifMsg = `💌 <b>Kabar Baik!</b>\nJessica (atau pengunjung) baru saja <b>mengaktifkan notifikasi pembaruan</b> di browsernya!\nTotal perangkat terdaftar: <b>${data.length}</b>.`;
      sendTelegramAlert(notifMsg);
    }

    res.status(201).json({ ok: true, message: 'Langganan berhasil disimpan.' });
  } catch (error) {
    console.error('Error in /api/subscribe:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Helper: Kirim Web Push ke Semua Perangkat Terdaftar
async function sendPushToAll(title, body, url) {
  const subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
  if (subscriptions.length === 0) {
    return { successCount: 0, total: 0 };
  }

  const payload = JSON.stringify({
    title: title || 'Ada Cerita Baru untukmu! ✨',
    body: body || 'Buka website untuk melihat kenangan atau catatan baru.',
    url: url || 'https://onlyforjessica.my.id',
    icon: 'assets/gallery/Pic1.jpeg'
  });

  let successCount = 0;
  const activeSubscriptions = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      activeSubscriptions.push(sub);
      successCount++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log('[WebPush] Menghapus subscription yang sudah kadaluarsa.');
      } else {
        console.error('[WebPush Error]', err.message);
        activeSubscriptions.push(sub);
      }
    }
  }

  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(activeSubscriptions, null, 2));
  return { successCount, total: activeSubscriptions.length };
}

// 3. ENDPOINT: Broadcast Manual via API / Script
app.post('/api/broadcast', async (req, res) => {
  try {
    const { secret, title, body, url } = req.body;

    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ ok: false, error: 'Akses ditolak: ADMIN_SECRET salah.' });
    }

    const result = await sendPushToAll(title, body, url);

    res.json({
      ok: true,
      message: `Notifikasi berhasil dikirimkan ke ${result.successCount} perangkat!`,
      activeDevices: result.total
    });
  } catch (error) {
    console.error('Error in /api/broadcast:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 4. ENDPOINT: Otomatisasi GitHub Webhook (Saat Kamu git push)
app.post('/api/github-webhook', async (req, res) => {
  try {
    const event = req.headers['x-github-event'];

    // Tangani event ping saat pertama kali menambahkan webhook di GitHub
    if (event === 'ping') {
      console.log('[GitHub Webhook] Ping diterima dari GitHub!');
      sendTelegramAlert('🔗 <b>GitHub Webhook Berhasil Terhubung!</b>\nSetiap kamu melakukan <code>git push</code>, notifikasi otomatis dikirim ke pelihat.');
      return res.json({ ok: true, message: 'Pong! Webhook terhubung dengan sukses.' });
    }

    if (event === 'push') {
      const commitMsg = (req.body.head_commit && req.body.head_commit.message) || 'Pembaruan konten baru';
      const pusherName = (req.body.pusher && req.body.pusher.name) || 'Andrian';

      console.log(`[GitHub Webhook] Push terdeteksi dari ${pusherName}: "${commitMsg}"`);

      // Kirim Web Push ke semua pengunjung yang subscribe
      const pushResult = await sendPushToAll(
        'Ada Cerita Baru untukmu! ✨',
        'Website baru saja diperbarui. Yuk lihat apa yang baru!',
        'https://onlyforjessica.my.id'
      );

      // Beri notif ke Telegram pembuat
      const telegramText = [
        `🚀 <b>Pembaruan Website Terdeteksi! (git push)</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `Commit: <i>"${commitMsg}"</i>`,
        `Pengirim: <b>${pusherName}</b>`,
        `Web Push: <b>Terkirim ke ${pushResult.successCount} perangkat pelihat</b>`,
        `━━━━━━━━━━━━━━━━━━`
      ].join('\n');

      sendTelegramAlert(telegramText);

      return res.json({
        ok: true,
        message: 'Push event diproses dan notifikasi broadcast telah dikirim.',
        deliveredTo: pushResult.successCount
      });
    }

    res.json({ ok: true, message: `Event ${event} diterima tapi tidak diproses.` });
  } catch (error) {
    console.error('Error in /api/github-webhook:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Jessica Surprise Server berjalan!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🤖 Telegram Bot Alert: AKTIF (Chat ID: ${process.env.TELEGRAM_CHAT_ID})`);
  console.log(`=========================================`);
});
