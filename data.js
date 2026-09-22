// ============================================================
// SEMUA KONTEN TEKS ADA DI SINI.
// Edit file ini kapan aja tanpa perlu sentuh script.js / style.css
// ============================================================

window.SITE_DATA = {

  recipient: "Jessica",

  // ---------------- SCENE 1: TERMINAL LOGIN ----------------
  terminal: {
    promptLabel: "guest@heart:~$",
    bootLines: [
      "sistem kenangan v1.0",
      "ketik perintah di bawah untuk mulai."
    ],
    guide: "Guide 1: SSH ke heart (ssh username@heart)",
    steps: [
      {
        type: "login",
        command: "ssh jessica@heart",
        loadingLines: [
          "[ssh] menghubungkan ke heart...",
          "[ssh] memeriksa jalur akses...",
          "[ssh] mengenkripsi koneksi...",
          "[ssh] akses diterima."
        ],
        loadingDurationMs: 1800,
        promptLabelAfter: "jessica@heart:~$",
        successText: "Berhasil !!"
      },
      {
        type: "output",
        command: "ls",
        guide: "Guide 2: cek isi folder (ketik ls)",
        output: [
          "surat_rahasia/  kenangan/  kejutan.txt",
          "Ada cukup banyak kenangan di sini."
        ]
      },
      {
        type: "transition",
        command: "ls -a",
        guide: "Guide 3: ketik ls -a untuk membuka kejutan"
      }
    ]
  },

  // ---------------- SCENE 2: MAIN SCENE ----------------
  main: {
    heroEyebrow: "untuk Jessica",
    heroTitle: "Happy Birthday, Jessica",
    heroSubtitle: "Selamat Ulang tahun yang ke-19 Jessica, Semoga panjang umur dan sehat selalu ya❤️",

    // Format: YYYY-MM-DDTHH:mm:ss (waktu lokal)
    nextBirthday: "2027-10-18T00:00:00",
    countdownLabel: "menuju ulang tahunmu berikutnya",

    gallery: {
      eyebrow: "galeri",
      heading: "beberapa momen kita",
      photos: [
        { src: "assets/gallery/Pic1.jpeg", caption: "Awal dari banyak cerita manis" },
        { src: "assets/gallery/Pic2.jpeg", caption: "Senyum Paling Favorit" },
        { src: "assets/gallery/Pic3.png", caption: "Salah 1 Momenttt Favorit" },
        { src: "assets/gallery/Pic4.jpeg", caption: "Pusing tapi cakeppppp" },
        { src: "assets/gallery/Pic5.jpeg", caption: "Tempat biasa, Kenangan Luar biasa" },
        { src: "assets/gallery/Pic6.jpeg", caption: "Batak Pride🤟" }
      ]
    },

    letter: {
      eyebrow: "sepucuk surat",
      envelopeLabel: "untuk Jessica",
      hint: "klik amplopnya",
      paragraphs: [
        "[ganti dengan paragraf pertama ucapan]",
        "[ganti dengan paragraf kedua ucapan]",
        "[ganti dengan paragraf ketiga, kalau perlu]"
      ],
      closingLine: "Sampai ulang tahunmu berikutnya.",
      signature: "— Still"
    }
  },

  audio: {
    src: "assets/audio/bgm.mp3",
    label: "Canon in D — Pachelbel"
  }
};
