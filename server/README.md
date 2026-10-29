# Jessica Surprise — Notification Server (Backend VM)

Backend ringan ini bertugas untuk:
1. Mengirim notifikasi instan ke Telegram pribadimu setiap ada yang mengetik PIN di website.
2. Menyimpan langganan Web Push Jessica saat dia menyetujui notifikasi.
3. Mengirim Web Push Notification ke HP/Laptop Jessica saat ada cerita/foto baru.

---

## 🚀 Panduan Setup di VM Lokalmu

### 1. Masuk ke VM dan Navigasi ke folder server
Jika kamu clone/pull repo ini di VM:
```bash
cd jessica-surprise/server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Cek Konfigurasi `.env`
File `.env` sudah terisi dengan data yang kamu berikan:
* `TELEGRAM_BOT_TOKEN=8293629800:AAH0C-FZNIwGJ1iGDa4rENVW2xoYFAyHpr4`
* `TELEGRAM_CHAT_ID=6555824079`
* `VAPID_PUBLIC_KEY=BNjNxN5eSBXcTLFZxC55Oy9U-44P38TWLHu3jGGWvgS4jU6FUKPurLAGxDhj0JOazPXl854WYxk5N76TPZW52Oc`
* `VAPID_PRIVATE_KEY=EVWdCyowi4gYZ25oronb6Ii6PkYv1PAoHolTssFtz0Q`

### 4. Jalankan Server dengan PM2 (Agar selalu hidup di latar belakang)
```bash
npm install -g pm2
pm2 start server.js --name "jessica-api"
pm2 save
pm2 startup
```

---

## 🌐 Sambungkan Cloudflare Tunnel

Buka dashboard Cloudflare Zero Trust atau edit konfigurasi tunnel di VM:
* Arahkan subdomain: `api.onlyforjessica.my.id`
* Service Type: `HTTP`
* URL: `localhost:3000`

Setelah tunnel aktif, coba buka di browsermu:
`https://api.onlyforjessica.my.id/health`
Jika muncul: `{"status":"online", ...}`, artinya backend sudah sukses terhubung ke internet!

---

## 📢 Cara Kirim Notifikasi Update ke Jessica

Kapan pun kamu selesai update website dan ingin memberi tahu Jessica di layar HP/Laptopnya:

Cukup jalankan script ini di terminal VM:
```bash
node broadcast.js "Judul Pesan" "Isi pesan yang mau kamu sampaikan"
```
*Contoh:*
```bash
node broadcast.js "Ada Cerita Baru! ✨" "Aku baru saja menambahkan beberapa foto baru di galeri kita."
```
Jessica akan langsung menerima pop-up notifikasi di perangkatnya yang bisa langsung diklik untuk membuka website!
