#!/usr/bin/env node
/**
 * Script cepat untuk kirim notifikasi ke Jessica langsung dari terminal VM:
 * Contoh:
 *   node broadcast.js "Ada foto baru!" "Aku baru aja nambahin foto kenangan kita di galeri."
 */

require('dotenv').config();

const title = process.argv[2] || 'Ada Cerita Baru untukmu! ✨';
const body = process.argv[3] || 'Buka website untuk melihat kenangan baru yang ditambahkan.';
const url = process.argv[4] || 'https://onlyforjessica.my.id';

const secret = process.env.ADMIN_SECRET || 'jessica-surprise-update-2026';
const port = process.env.PORT || 3000;

async function sendBroadcast() {
  console.log(`Mengirim notifikasi broadcast ke perangkat Jessica...`);
  console.log(`Judul: "${title}"`);
  console.log(`Pesan: "${body}"`);

  try {
    const res = await fetch(`http://localhost:${port}/api/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, title, body, url })
    });
    const result = await res.json();
    console.log('Hasil:', result);
  } catch (error) {
    console.error('Gagal mengirim broadcast:', error.message);
  }
}

sendBroadcast();
