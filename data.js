// ============================================================
// Konten untuk main scene ada di sini.
// Tampilan opening diatur melalui index.html dan style.css.
// ============================================================

window.SITE_DATA = {

  recipient: "Jessica",

  // ---------------- SCENE 2: MAIN SCENE ----------------
  main: {
    heroEyebrow: "18 Oktober · hari tentang kamu",
    heroTitle: "Selamat ulang tahun, Jessica",
    heroSubtitle: "Selamat ulang tahun ke-19, Jessica. Semoga hari-harimu dipenuhi hal baik—dan selalu ada alasan untuk tersenyum. ❤️",

    // Format: YYYY-MM-DDTHH:mm:ss (waktu lokal)
    nextBirthday: "2027-10-18T00:00:00",
    countdownLabel: "menghitung hari menuju hari istimewamu",

    gallery: {
      eyebrow: "beberapa momen favoritku",
      heading: "Hal kecil yang selalu membuatku tersenyum",
      photos: [
        { src: "assets/gallery/Pic1.jpeg", caption: "Satu selfie malam yang menyimpan banyak tawa." },
        { src: "assets/gallery/Pic2.jpeg", caption: "Tiga senyum dan pose kompak dalam satu frame.", objectPosition: "60% center" },
        { src: "assets/gallery/Pic3.png", caption: "Pose berdua di bawah cahaya lampu malam." },
        { src: "assets/gallery/Pic4.jpeg", caption: "Momen random saat jalan-jalan yang bikin senyum." },
        { src: "assets/gallery/Pic5.jpeg", caption: "Makan bareng sederhana, ceritanya jadi istimewa.", objectPosition: "44% center" },
        { src: "assets/gallery/Pic6.jpeg", caption: "Selfie dari ujung meja, semua ikut masuk frame." },
        { src: "assets/gallery/Pic7.jpeg", caption: "Senyum santai yang diam-diam jadi favorit." },
        { src: "assets/gallery/Pic8.jpeg", caption: "Pose miring dengan senyum manis di rumah." },
        { src: "assets/gallery/Pic9.jpeg", caption: "Gaya beda, senyum yang tetap khas." },
        { src: "assets/gallery/Pic10.jpeg", caption: "Senyum kecil yang bikin foto ini terasa hangat." },
        { src: "assets/gallery/Pic11.jpeg", caption: "Peace sign dan ekspresi jahil yang susah dilupakan." },
        { src: "assets/gallery/Pic12.jpeg", caption: "Kacamata favorit dan senyum yang menular." },
        { src: "assets/gallery/Pic13.jpeg", caption: "Satu pose manyun untuk melengkapi seri foto hari itu." },
        { src: "assets/gallery/Pic14.jpeg", caption: "Gaya peace di bawah lampu malam." },
        { src: "assets/gallery/Pic15.jpeg", caption: "Pose manis sambil menikmati suasana malam." },
        { src: "assets/gallery/Pic16.jpeg", caption: "Senyum lepas di sela obrolan malam." },
        { src: "assets/gallery/Pic17.jpeg", caption: "Tampil anggun dengan kemeja putih." },
        { src: "assets/gallery/Pic18.jpeg", caption: "Langit biru dan langkah santai di tepi pantai." },
        { src: "assets/gallery/Pic19.jpeg", caption: "Angin pantai membuat pose sederhana terasa hidup." },
        { src: "assets/gallery/Pic20.jpeg", caption: "Hari cerah di pesisir dengan senyum yang ikut menyala." },
        { src: "assets/gallery/Pic21.jpeg", caption: "Potret dekat dengan senyum yang menenangkan." },
        { src: "assets/gallery/Pic22.jpeg", caption: "Tawa kecil dan gaya rambut yang ikut bergerak." }
      ]
    },

    roadmap: {
      eyebrow: "catatan kecil",
      heading: "Momen sederhana, arti yang tinggal",
      items: [
        { src: "assets/gallery/Pic1.jpeg", caption: "Pertemuan tak sengaja yang jadi awal cerita kecil ini." },
        { src: "assets/gallery/Pic2.jpeg", caption: "Senyummu punya cara sendiri membuat hari terasa lebih ringan." },
        { src: "assets/gallery/Pic3.png", caption: "Di antara hari biasa, ada momen yang ingin kusimpan lama." },
        { src: "assets/gallery/Pic4.jpeg", caption: "Belum lama saling mengenal, tapi tiap cerita kecil terasa berarti." },
        { caption: "Semoga masih banyak hari baik yang bisa kita rayakan bersama." }
      ]
    },

    letter: {
      eyebrow: "dari Andrian, untukmu",
      envelopeLabel: "untuk Jessica",
      hint: "klik amplopnya",
      paragraphs: [
        "Hai Jessica, senang sekali bisa kenal kamu. Tepat hari ini, 18 Oktober, genap lima minggu sejak kita mulai saling mengenal. Walaupun kita baru mulai ngobrol sejak PKKMB, pertemuan pertama kita sebenarnya terjadi tanpa sengaja—waktu aku menginjak kakimu. Hehe, maaf ya. Kalau diingat lagi, lucu juga.",
        "Surat ini memang sederhana, tapi ada doa yang ingin kusampaikan. Semoga di usia barumu ini, satu per satu impianmu bisa terwujud.",
        "Semoga kamu selalu sehat dan bahagia, dan semoga setiap langkahmu dimudahkan. Aku berharap tahun ini membawa banyak hal baik untukmu."
      ],
      closingLine: "Semoga hari ini terasa sehangat dirimu.",
      signature: "~Andrian"
    }
  },

  audio: {
    src: "assets/audio/bgm.mp3",
    label: "Canon in D — Pachelbel"
  }
};
