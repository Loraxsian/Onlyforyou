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
    heroSubtitle: "Selamat Ulang tahun yang ke-19 And Jessica Nova Lya Mendrofa, Semoga panjang umur dan sehat selalu ya❤️",

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

    roadmap: {
      eyebrow: "roadmap journey",
      heading: "perjalanan yang masih panjang",
      items: [
        { src: "assets/gallery/Pic1.jpeg", caption: "Satu pertemuan kecil yang membuka banyak kemungkinan." },
        { src: "assets/gallery/Pic2.jpeg", caption: "Menyimpan senyum-senyum yang ingin kita ingat lagi." },
        { src: "assets/gallery/Pic3.png", caption: "Menemukan cerita baru di antara hari-hari biasa." },
        { src: "assets/gallery/Pic4.jpeg", caption: "Melangkah bersama, pelan-pelan, menuju lebih banyak momen." },
        { caption: "Di masa depan, akan ada banyak kenangan indah lainnya yang akan kita kumpulkan di sini..." }
      ]
    },

    letter: {
      eyebrow: "sepucuk surat",
      envelopeLabel: "untuk Jessica",
      hint: "klik amplopnya",
      paragraphs: [
        "Hai Jessica, senang berkenalan denganmu. Tepat hari ini, tanggal 18 Oktober, kita sudah saling mengenal selama 5 minggu. Walaupun kita baru mulai berbicara sejak PKKMB, pertemuan pertama kita sebenarnya dimulai dari kejadian yang tidak sengaja saat aku menginjak kakimu. Hehe, maaf ya. Kalau diingat-ingat, rasanya lucu dan menarik, wkwkwk.",
        "Ya, isi surat ini memang tidak banyak, tetapi aku ingin menyampaikan sedikit doa dan harapan untukmu. Semoga di usia barumu ini, impianmu satu per satu dapat terwujud.",
        "Semoga kamu selalu sehat, bahagia, dan diberi kelancaran serta kelimpahan dalam setiap langkahmu. Sekian dulu surat singkat dariku."
      ],
      closingLine: "Sampai ulang tahunmu berikutnya.",
      signature: "~Andrian"
    }
  },

  audio: {
    src: "assets/audio/bgm.mp3",
    label: "Canon in D — Pachelbel"
  }
};
