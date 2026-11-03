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

    gallery: {
      eyebrow: "beberapa momen favoritku",
      heading: "Hal kecil yang selalu membuatku tersenyum",
      photos: [
        { src: "assets/gallery/Pic1.jpeg", caption: "Malam Ceria, Semuanya Peaceful" },
        { src: "assets/gallery/Pic2.jpeg", caption: "Gak pakai wacana, Sung ketawa", objectPosition: "60% center" },
        { src: "assets/gallery/Pic3.png", caption: "Dibawah cahaya lampu malam, yang satu kaku, yang satu manyun" },
        { src: "assets/gallery/Pic4.jpeg", caption: "Ketangkep" },
        { src: "assets/gallery/Pic5.jpeg", caption: "Makan bareng bersama Batak Pride", objectPosition: "44% center" },
        { src: "assets/gallery/Pic6.jpeg", caption: "First Nongki Batak Pride after PKKMB" },
        { src: "assets/gallery/Pic7.jpeg", caption: "Senyum santai yang diam-diam jadi favorit." },
        { src: "assets/gallery/Pic8.jpeg", caption: "Senyum Manis, ini boleh diklaim gak sih?" },
        { src: "assets/gallery/Pic9.jpeg", caption: "Gaya beda, senyum yang tetap khas." },
        { src: "assets/gallery/Pic10.jpeg", caption: "Senyum kecil yang bikin foto ini terasa hangat.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic11.jpeg", caption: "Peace sign dan ekspresi jahil" },
        { src: "assets/gallery/Pic12.jpeg", caption: "Jelas, Yang kek gini gak boleh hilang", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic13.jpeg", caption: "Manyun banget ini mah.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic14.jpeg", caption: "Peace di bawah lampu malam.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic15.jpeg", caption: "Pose manis sambil menikmati suasana malam.", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic16.jpeg", caption: "Senyum Anteng yah kek gini, kalem", objectPosition: "center 40%" },
        { src: "assets/gallery/Pic17.jpeg", caption: "Tampil anggun dengan kemeja putih." },
        { src: "assets/gallery/Pic18.jpeg", caption: "Langit biru dan langkah santai di tepi pantai." },
        { src: "assets/gallery/Pic19.jpeg", caption: "Angin pantai membuat pose sederhana terasa hidup." },
        { src: "assets/gallery/Pic20.jpeg", caption: "Hari cerah di pesisir dengan senyum yang ikut menyala." },
        { src: "assets/gallery/Pic21.jpeg", caption: "Potret dekat dengan senyum yang menenangkan." },
        { src: "assets/gallery/Pic22.jpeg", caption: "Tawa kecil dan gaya rambut yang ikut bergerak." },
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
      signature: "~Andrian"
    }
  },

  audio: {
    src: "assets/audio/bgm.mp3",
    label: "Canon in D — Pachelbel"
  }
};
