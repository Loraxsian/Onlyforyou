(function () {
  const DATA = window.SITE_DATA;
  const body = document.body;

  const sceneTerminal = document.getElementById('scene-terminal');
  const sceneMain = document.getElementById('scene-main');

  function showMain() {
    sceneTerminal.classList.remove('active');
    sceneMain.classList.add('active');
    body.classList.add('main-active');
  }

  // ---------------- audio ----------------
  const audio = document.getElementById('bgm');
  audio.src = DATA.audio.src;
  audio.loop = true;
  audio.volume = 0.35;

  function playAudio() {
    audio.play().catch(() => {
      /* autoplay blocked — visitor can unmute/retry from the mute button */
    });
  }
  const muteBtn = document.getElementById('mute-btn');
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? 'unmute' : 'mute';
  });

  // ================= SCENE 1: TERMINAL LOGIN =================
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  const terminalPromptLabel = document.getElementById('terminal-prompt-label');
  const terminalGuide = document.getElementById('terminal-guide');
  let stepIndex = 0;
  let awaitingLogin = false;

  function printLine(text, cls) {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
  }

  function resetTerminal() {
    stepIndex = 0;
    awaitingLogin = false;
    terminalOutput.innerHTML = '';
    terminalInput.disabled = false;
    terminalInput.value = '';
    terminalPromptLabel.textContent = DATA.terminal.promptLabel;
    terminalGuide.textContent = DATA.terminal.guide;
    DATA.terminal.bootLines.forEach((l) => printLine(l, 'dim'));
    printLine('');
    terminalInput.focus();
  }

  function currentStep() {
    return DATA.terminal.steps[stepIndex];
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || awaitingLogin) return;
    const typed = terminalInput.value.trim();
    terminalInput.value = '';
    const step = currentStep();
    if (!step) return;

    printLine(terminalPromptLabel.textContent + ' ' + typed);

    if (typed.toLowerCase() !== step.command.toLowerCase()) {
      printLine('perintah tidak dikenali, coba lagi.', 'dim');
      return;
    }

    if (step.type === 'login') {
      awaitingLogin = true;
      terminalInput.disabled = true;
      const loadingLines = step.loadingLines || [step.loadingText];
      let loadingIndex = 0;
      printLine(loadingLines[loadingIndex], 'dim');
      const loadingTimer = setInterval(() => {
        loadingIndex += 1;
        if (loadingIndex < loadingLines.length) printLine(loadingLines[loadingIndex], 'dim');
      }, step.loadingDurationMs / loadingLines.length);
      setTimeout(() => {
        clearInterval(loadingTimer);
        printLine(step.successText, 'accent');
        printLine('');
        stepIndex += 1;
        terminalPromptLabel.textContent = step.promptLabelAfter || DATA.terminal.promptLabel;
        terminalGuide.textContent = DATA.terminal.steps[stepIndex].guide || '';
        awaitingLogin = false;
        terminalInput.disabled = false;
        terminalInput.focus();
      }, step.loadingDurationMs);
    } else if (step.type === 'output') {
      step.output.forEach((l) => printLine(l));
      printLine('');
      stepIndex += 1;
      terminalGuide.textContent = DATA.terminal.steps[stepIndex].guide || '';
    } else if (step.type === 'transition') {
      printLine('');
      terminalInput.disabled = true;
      playAudio(); // user gesture (Enter keypress) already happened
      setTimeout(() => {
        showMain();
        triggerMainSceneEnter();
      }, 500);
    }
  });

  // ================= SCENE 2: MAIN =================
  let mainInitialized = false;

  function triggerMainSceneEnter() {
    burstFireworks();
    startCountdown();
    if (!mainInitialized) {
      mainInitialized = true;
      document.getElementById('hero-eyebrow').textContent = DATA.main.heroEyebrow;
      document.getElementById('hero-title').textContent = DATA.main.heroTitle;
      document.getElementById('hero-subtitle').textContent = DATA.main.heroSubtitle;
      document.getElementById('countdown-caption').textContent = DATA.main.countdownLabel;
      document.getElementById('gallery-eyebrow').textContent = DATA.main.gallery.eyebrow;
      document.getElementById('gallery-heading').textContent = DATA.main.gallery.heading;
      document.getElementById('letter-eyebrow').textContent = DATA.main.letter.eyebrow;
      document.getElementById('envelope-label').textContent = DATA.main.letter.envelopeLabel;
      document.getElementById('letter-hint').textContent = DATA.main.letter.hint;
      buildGallery();
      buildLetter();
      spawnFallingFlowers();
    }
  }

  // ---- falling flowers (cloned from reference, lightweight emoji spans) ----
  function spawnFallingFlowers() {
    const container = document.getElementById('flower-fall-container');
    const flowerEmojis = ['🌸', '🌷', '🌺', '🌼', '🌻'];
    const total = window.innerWidth < 600 ? 12 : 20;
    for (let i = 0; i < total; i++) {
      const el = document.createElement('span');
      el.className = 'falling-flower';
      el.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
      const size = Math.random() * 14 + 14; // 14px - 28px
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 12; // 12s - 22s
      const delay = Math.random() * 20;
      el.style.left = left + 'vw';
      el.style.fontSize = size + 'px';
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = '-' + delay + 's';
      container.appendChild(el);
    }
  }

  // ---- fireworks (lightweight canvas particle burst, plays once per entry) ----
  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas.getContext('2d');
  let fwParticles = [];
  let fwAnimId = null;
  const fwColors = ['#e8829f', '#d1637f', '#f4c9a1', '#fff3e0'];

  function resizeFireworksCanvas() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeFireworksCanvas);
  resizeFireworksCanvas();

  function spawnBurst(cx, cy) {
    const count = 46;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2.2 + Math.random() * 2.4;
      fwParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: fwColors[Math.floor(Math.random() * fwColors.length)]
      });
    }
  }

  function burstFireworks() {
    fwParticles = [];
    const w = fwCanvas.width;
    const h = fwCanvas.height;
    spawnBurst(w * 0.3, h * 0.35);
    setTimeout(() => spawnBurst(w * 0.7, h * 0.3), 300);
    setTimeout(() => spawnBurst(w * 0.5, h * 0.45), 600);

    if (fwAnimId) cancelAnimationFrame(fwAnimId);
    const start = performance.now();
    function tick(now) {
      fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
      fwParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045; // gravity
        p.life -= 0.012;
        fwCtx.globalAlpha = Math.max(p.life, 0);
        fwCtx.fillStyle = p.color;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        fwCtx.fill();
      });
      fwCtx.globalAlpha = 1;
      fwParticles = fwParticles.filter((p) => p.life > 0);
      if (now - start < 3000) {
        fwAnimId = requestAnimationFrame(tick);
      } else {
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
      }
    }
    fwAnimId = requestAnimationFrame(tick);
  }

  // ---- countdown ----
  let countdownTimer = null;
  function startCountdown() {
    const birthday = new Date(DATA.main.nextBirthday);

    function update() {
      const now = Date.now();
      const currentDate = new Date(now);
      let target = new Date(
        currentDate.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      ).getTime();

      if (target <= now) {
        target = new Date(
          currentDate.getFullYear() + 1,
          birthday.getMonth(),
          birthday.getDate()
        ).getTime();
      }

      let diff = target - now;
      const day = Math.floor(diff / 86400000);
      diff -= day * 86400000;
      const hour = Math.floor(diff / 3600000);
      diff -= hour * 3600000;
      const min = Math.floor(diff / 60000);
      diff -= min * 60000;
      const sec = Math.floor(diff / 1000);
      document.getElementById('cd-days').textContent = String(day);
      document.getElementById('cd-hours').textContent = String(hour).padStart(2, '0');
      document.getElementById('cd-minutes').textContent = String(min).padStart(2, '0');
      document.getElementById('cd-seconds').textContent = String(sec).padStart(2, '0');
    }
    update();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(update, 1000);
  }

  // ---- gallery ----
  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  function buildGallery() {
    DATA.main.gallery.photos.forEach((photo) => {
      const card = document.createElement('div');
      card.className = 'polaroid';
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      const cap = document.createElement('div');
      cap.className = 'polaroid-caption';
      cap.textContent = photo.caption;
      card.appendChild(img);
      card.appendChild(cap);
      card.addEventListener('click', () => {
        lightboxImg.src = photo.src;
        lightbox.classList.add('visible');
      });
      galleryGrid.appendChild(card);
    });
  }
  lightbox.addEventListener('click', () => lightbox.classList.remove('visible'));

  // ---- letter ----
  const envelopeWrap = document.getElementById('envelope-wrap');
  const letterPaper = document.getElementById('letter-paper');

  function buildLetter() {
    DATA.main.letter.paragraphs.forEach((p) => {
      const el = document.createElement('p');
      el.textContent = p;
      letterPaper.appendChild(el);
    });
    const closing = document.createElement('p');
    closing.className = 'letter-closing';
    closing.textContent = DATA.main.letter.closingLine;
    letterPaper.appendChild(closing);
    const sig = document.createElement('div');
    sig.className = 'letter-signature';
    sig.textContent = DATA.main.letter.signature;
    letterPaper.appendChild(sig);
  }

  envelopeWrap.addEventListener('click', () => {
    if (envelopeWrap.classList.contains('open')) return;
    envelopeWrap.classList.add('open');
    setTimeout(() => letterPaper.classList.add('visible'), 350);
  });

  // ---------------- init ----------------
  document.title = 'untuk ' + DATA.recipient;
  terminalPromptLabel.textContent = DATA.terminal.promptLabel;
  terminalGuide.textContent = DATA.terminal.guide;
  resetTerminal();
})();
