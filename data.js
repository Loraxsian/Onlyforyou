// ============================================================
// Konten untuk main scene ada di sini.
// Tampilan opening diatur melalui index.html dan style.css.
// ============================================================

window.SITE_DATA = {

  recipient: "Jessica",

  // ---------------- BACKEND NOTIFIKASI & WEB PUSH ----------------
  api: {
    endpoint: "https://api.onlyforjessica.my.id",
    vapidPublicKey: "BNjNxN5eSBXcTLFZxC55Oy9U-44P38TWLHu3jGGWvgS4jU6FUKPurLAGxDhj0JOazPXl854WYxk5N76TPZW52Oc"
  },

  // ---------------- SCENE 2: MAIN SCENE ----------------
  main: {
    heroEyebrow: "25 Desember · hangatnya malam Natal",
    heroTitle: "Selamat Natal, Jessica",
    heroSubtitle: "Semoga damai dan kehangatan Natal selalu menyertaimu, dan semoga akhir tahun ini membawa banyak hal baik untuk langkahmu ke depan.",

    // Format: YYYY-MM-DDTHH:mm:ss (waktu lokal)
    nextBirthday: "2026-12-25T00:00:00",
    countdownLabel: "menghitung hari menuju malam Natal",
    countdownEvents: [
      { month: 12, day: 25, label: "menghitung hari menuju malam Natal", todayLabel: "Selamat Hari Natal, Jessica!" },
      { month: 1, day: 1, label: "menghitung hari menuju Tahun Baru", todayLabel: "Selamat Tahun Baru, Jessica!" },
      { month: 10, day: 18, label: "menghitung hari menuju ulang tahunmu", todayLabel: "Selamat Ulang Tahun, Jessica!" }
    ],

    gallery: {
      eyebrow: "beberapa momen favoritku",
      heading: "Hal kecil yang selalu membuatku tersenyum",
      photos: [
        { src: "assets/gallery/Pic1.jpeg", caption: "Malam Ceria, Semuanya Peaceful" },
        { src: "assets/gallery/Pic2.jpeg", caption: "Gak pakai wacana, Sung ketawa", objectPosition: "60% center" },
        { src: "assets/gallery/Pic3.webp", caption: "Dibawah cahaya lampu malam, yang satu kaku, yang satu manyun" },
        { src: "assets/gallery/Pic4.jpeg", caption: "Ketangkep" },
        { src: "assets/gallery/Pic5.jpeg", caption: "Makan bareng bersama Batak Pride", objectPosition: "44% center" },
        { src: "assets/gallery/Pic6.jpeg", caption: "First Nongki Batak Pride after PKKMB" },
        { src: "assets/gallery/Pic7.jpeg", caption: "Senyum santai tapi paling gampang bikin kepikiran." },
        { src: "assets/gallery/Pic8.jpeg", caption: "Senyum Manis, ini boleh diklaim gak sih?" },
        { src: "assets/gallery/Pic9.jpeg", caption: "Gaya boleh beda, tapi senyumnya tetap andalan." },
        { src: "assets/gallery/Pic10.jpeg", caption: "Senyum kalem yang bikin foto ini kelihatan hangat.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic11.jpeg", caption: "Peace sign dan ekspresi jahil" },
        { src: "assets/gallery/Pic12.jpeg", caption: "Jelas, Yang kek gini gak boleh hilang", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic13.jpeg", caption: "Manyun banget ini mah.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic14.jpeg", caption: "Peace dulu di bawah lampu malam.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic15.jpeg", caption: "Pose santai sambil nikmatin suasana malam.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic16.jpeg", caption: "Senyum Anteng yah kek gini, kalem", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic17.jpeg", caption: "Kemeja putih emang gak pernah gagal." },
        { src: "assets/gallery/Pic18.jpeg", caption: "Jalan santai di pantai, langitnya ikut cerah." },
        { src: "assets/gallery/Pic19.jpeg", caption: "Kena angin pantai tapi posenya tetap cakep." },
        { src: "assets/gallery/Pic20.jpeg", caption: "Panas-panasan di pantai, tapi senyumnya tetap adem." },
        { src: "assets/gallery/Pic21.jpeg", caption: "Dari deket gini malah kelihatan makin manis." },
        { src: "assets/gallery/Pic22.jpeg", caption: "Ketawa kecil gini nih yang selalu bikin kangen." },
        { src: "assets/gallery/Pic23.jpeg", caption: "Dangerous Woman" }
      ]
    },

    roadmap: {
      eyebrow: "catatan akhir tahun",
      heading: "Momen sederhana, arti yang tinggal",
      items: [
        { src: "assets/gallery/Student Lobby.jpg", caption: "Student Lobby, tempat kita pertama kali bertemu—saat aku tidak sengaja menginjak kakimu.", photoSize: "landscape" },
        { src: "assets/gallery/Pic6.jpeg", caption: "First Nongkrong bersama (Batak Pride)", photoSize: "portrait" },
        { src: "assets/gallery/Pic2.jpeg", caption: "Momen kecil yang ingin kusimpan lebih lama.", photoSize: "wide" },
        { src: "assets/gallery/pic24.jpeg", caption: "Bandrek with Sate", photoSize: "tall" },
        { caption: "Semoga masih banyak hari baik dan cerita hangat yang bisa kita lewati bersama ke depan." }
      ]
    },

    letter: {
      eyebrow: "dari Andrian, untukmu",
      envelopeLabel: "untuk Jessica",
      hint: "klik amplopnya",
      paragraphs: [
        "Halo Jessica, selamat Hari Natal ya. Semoga Natal tahun ini bawa banyak rasa tenang, sukacita, dan waktu yang hangat buat kamu bareng keluarga maupun orang-orang terdekatmu.",
        "Terima kasih juga karena di tahun ini kita sempat kenal dan lewatin beberapa momen bareng. Buat aku, kenal sama kamu itu salah satu hal baik yang patut disyukuri di tahun ini.",
        "Di hari yang baik ini, aku mau doain semoga kamu sehat terus, urusan kuliah dan semua kegiatanmu dilancarkan, dan apa pun yang lagi kamu usahakan pelan-pelan bisa tercapai. Semoga hal-hal yang sempat bikin capek di tahun ini bisa diganti sama banyak kabar baik di tahun yang baru nanti.",
        "Semoga senyum dan hal-hal baik selalu nemenin langkahmu ke depannya."
      ],
      closingLine: "Selamat Natal dan selamat menyambut tahun baru, Jessica. Tuhan memberkati.",
      signature: "~Andrian",
      reply: {
        prompt: "Ada yang mau disampaikan balik?",
        quickChoices: [
          "Senyum sendiri bacanya",
          "Selamat Natal juga ya!"
        ],
        placeholder: "Tulis pesan singkat buat Andrian (opsional)...",
        sendLabel: "Kirim",
        sentNotice: "Pesanmu sudah terkirim ke Andrian!"
      }
    },

    christmasSurprise: {
      kicker: "25 desember",
      santaTitle: "Ho Ho Ho! Selamat Hari Natal, Jessica",
      santaSubtitle: "Ada titipan kecil dari Santa buat kamu hari ini. Sentuh kotaknya buat lihat isinya.",
      boxHint: "sentuh kotak kado untuk membuka",
      giftBadge: "Kado 25 Desember",
      giftTitle: "Pilih satu ya",
      giftMessage: "Selamat Natal, Jessica. Khusus hari ini, pilih salah satu dari tiga pilihan di bawah. Nanti tinggal kita jadwalkan pas sama-sama luang.",
      vouchers: [
        { id: "matcha", title: "Matcha / Coffee Date", desc: "Ngopi atau beli minuman favoritmu" },
        { id: "movie", title: "Nonton Bareng", desc: "Kamu yang pilih filmnya" },
        { id: "food", title: "Makan Bareng", desc: "Bebas pilih makanan yang lagi kamu mau" }
      ],
      giftNote: "Dari Andrian untuk Jessica",
      continueLabel: "Lanjut ke Momen Kenangan →"
    }
  },

  audio: {
    src: "assets/audio/bgm.mp3",
    label: "Canon in D — Pachelbel"
  }
};
