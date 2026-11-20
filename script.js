(function () {
  const DATA = window.SITE_DATA;
  const opening = document.getElementById('scene-opening');
  const main = document.getElementById('scene-main');
  const flowerTransition = document.getElementById('flower-transition');
  const pinMessage = document.getElementById('pin-message');
  const pinDots = document.querySelectorAll('.pin-dot');
  const audio = document.getElementById('bgm');
  const musicButton = document.getElementById('music-button');
  const PIN = '1810';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealDelay = reducedMotion ? 100 : 450;
  let enteredPin = '';
  let unlocked = false;
  let audioPrimed = false;

  audio.src = DATA.audio.src;
  audio.loop = true;
  audio.volume = 0.28;

  function renderPin() {
    pinDots.forEach((dot, index) => {
      dot.classList.toggle('is-filled', index < enteredPin.length);
    });
    document.getElementById('pin-dots').setAttribute(
      'aria-label',
      `${enteredPin.length} dari 4 angka sudah dimasukkan`
    );
  }

  const musicNowPlaying = document.getElementById('music-now-playing');
  let musicLabelTimer = 0;
  let chimeAudioCtx = null;

  function showMusicLabel() {
    if (!musicNowPlaying || !DATA.audio || !DATA.audio.label) return;
    musicNowPlaying.textContent = `♪ ${DATA.audio.label}`;
    musicNowPlaying.hidden = false;
    window.clearTimeout(musicLabelTimer);
    musicLabelTimer = window.setTimeout(() => {
      musicNowPlaying.hidden = true;
    }, 4500);
  }

  function playChime(kind = 'sparkle') {
    if (audio.paused) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      chimeAudioCtx ||= new AudioCtx();
      if (chimeAudioCtx.state === 'suspended') chimeAudioCtx.resume();
      const notes = kind === 'gift' ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880, 1174.66];
      const now = chimeAudioCtx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = chimeAudioCtx.createOscillator();
        const gain = chimeAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.055, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.55);
        osc.connect(gain);
        gain.connect(chimeAudioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch (e) {
      // Abaikan jika browser memblokir AudioContext
    }
  }

  function setMusicState(isPlaying) {
    musicButton.classList.toggle('is-playing', isPlaying);
    musicButton.setAttribute('aria-pressed', String(isPlaying));
    musicButton.setAttribute('aria-label', isPlaying ? 'Matikan musik' : 'Putar musik');
    if (isPlaying) {
      showMusicLabel();
    } else if (musicNowPlaying) {
      musicNowPlaying.hidden = true;
    }
  }

  let flowerSvgInstance = 0;
  // Organic dendrite snowflake: every flake gets its own branch lengths,
  // angles and tip shapes so no two look identical or rigid.
  function flowerSvg(index) {
    flowerSvgInstance += 1;
    const seedBase = index * 12.9898 + flowerSvgInstance * 78.233;
    const rand = (n) => {
      const x = Math.sin(seedBase + n * 37.719) * 43758.5453;
      return x - Math.floor(x);
    };
    const arm = 34 + rand(1) * 8;
    const branchSets = [
      { at: 0.3 + rand(2) * 0.08, len: 7 + rand(3) * 7, spread: 0.55 + rand(4) * 0.25 },
      { at: 0.55 + rand(5) * 0.08, len: 6 + rand(6) * 6, spread: 0.5 + rand(7) * 0.3 },
      { at: 0.78 + rand(8) * 0.06, len: 3 + rand(9) * 4, spread: 0.6 + rand(10) * 0.2 },
    ];
    const tipStyle = rand(11);
    let armPath = `M50 50 L50 ${(50 - arm).toFixed(1)}`;
    branchSets.forEach(({ at, len, spread }) => {
      const y = 50 - arm * at;
      const dx = len * Math.sin(spread);
      const dy = len * Math.cos(spread);
      armPath += ` M50 ${y.toFixed(1)} Q${(50 - dx * 0.45).toFixed(1)} ${(y - dy * 0.35).toFixed(1)} ${(50 - dx).toFixed(1)} ${(y - dy).toFixed(1)}`;
      armPath += ` M50 ${y.toFixed(1)} Q${(50 + dx * 0.45).toFixed(1)} ${(y - dy * 0.35).toFixed(1)} ${(50 + dx).toFixed(1)} ${(y - dy).toFixed(1)}`;
    });
    const tipY = 50 - arm;
    const tip = tipStyle > 0.5
      ? `<circle cx="50" cy="${tipY.toFixed(1)}" r="1.6"/>`
      : `<path d="M50 ${(tipY - 3).toFixed(1)} L52 ${tipY.toFixed(1)} L50 ${(tipY + 3).toFixed(1)} L48 ${tipY.toFixed(1)} Z"/>`;
    const arms = Array.from({ length: 6 }, (_, i) => {
      const jitter = (rand(20 + i) - 0.5) * 4;
      return `<g transform="rotate(${i * 60 + jitter} 50 50)"><path d="${armPath}"/>${tip}</g>`;
    }).join('');
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="rgba(190,225,255,0.35)" stroke-width="4.2" stroke-linecap="round">${arms.replace(/<circle[^>]*\/>|<path d="M50 [\d.]+ L52[^>]*\/>/g, '')}</g>
      <g fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${arms}</g>
      <circle cx="50" cy="50" r="4.2" fill="none" stroke="#ffffff" stroke-width="1.3"/>
      <circle cx="50" cy="50" r="1.8" fill="#eaf6ff"/>
    </svg>`;
  }

  function addFlowerTrail(x, y, progress) {
    const trail = document.createElement('span');
    const size = 13 + 23 * progress;
    trail.className = 'flower-trail';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    trail.style.width = `${size}px`;
    trail.style.height = `${size}px`;
    trail.style.transform = 'translate(-50%, -50%)';
    document.getElementById('flower-transition-trails').appendChild(trail);
    window.setTimeout(() => trail.remove(), 560);
  }

  function createFlowerWave(landX, landY) {
    const pieces = document.getElementById('flower-transition-pieces');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const maxDistance = Math.hypot(width, height);
    // Fewer, larger blooms overlap into a full-screen floral canopy.
    const cellCount = reducedMotion
      ? 18
      : Math.min(110, Math.max(18, Math.round((width * height) / 18000)));
    const cellSize = Math.sqrt((width * height) / cellCount);
    const columns = Math.max(1, Math.round(width / cellSize));
    const rows = Math.max(1, Math.round(height / cellSize));
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const targets = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        targets.push({
          x: cellWidth * (column + 0.5) + (Math.random() - 0.5) * cellWidth * 0.7,
          y: cellHeight * (row + 0.5) + (Math.random() - 0.5) * cellHeight * 0.7,
          layered: false,
        });
      }
    }

    const extras = Math.round(targets.length * 0.62);
    for (let i = 0; i < extras; i += 1) {
      targets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        layered: true,
      });
    }

    let lastEnd = 0;
    targets.forEach(({ x, y, layered }, index) => {
      const element = document.createElement('span');
      const distance = Math.hypot(x - landX, y - landY);
      const delay = (distance / maxDistance) * (reducedMotion ? 160 : 1500)
        + Math.random() * (reducedMotion ? 35 : 150)
        + (layered ? Math.random() * (reducedMotion ? 20 : 320) : 0);
      const duration = reducedMotion ? 260 + Math.random() * 80 : 1150 + Math.random() * 480;
      const isPuff = index % 3 === 1;
      const size = isPuff
        ? cellSize * (0.45 + Math.random() * 0.45)
        : cellSize * (0.95 + Math.random() * 0.48);
      const middleScale = 1.04 + Math.random() * 0.15;
      const finalScale = 0.72 + Math.random() * 0.36;
      const startRotation = (Math.random() - 0.5) * 90;
      const middleRotation = startRotation + (Math.random() - 0.5) * 240;
      const endRotation = middleRotation + (Math.random() - 0.5) * 90;

      element.className = isPuff ? 'flower-piece snow-puff' : 'flower-piece';
      if (!isPuff) {
        element.innerHTML = flowerSvg(index + 2);
      }
      element.style.setProperty('--bloom-x', `${landX}px`);
      element.style.setProperty('--bloom-y', `${landY}px`);
      element.style.setProperty('--flower-size', `${size}px`);
      element.style.setProperty('--target-x', `${x - landX}px`);
      element.style.setProperty('--target-y', `${y - landY}px`);
      element.style.setProperty('--middle-x', `${(x - landX) * 1.08}px`);
      element.style.setProperty('--middle-y', `${(y - landY) * 1.08}px`);
      element.style.setProperty('--target-scale', finalScale);
      element.style.setProperty('--middle-scale', middleScale);
      element.style.setProperty('--rot-start', `${startRotation}deg`);
      element.style.setProperty('--rot-middle', `${middleRotation}deg`);
      element.style.setProperty('--rot-end', `${endRotation}deg`);
      element.style.setProperty('--flight-duration', `${duration}ms`);
      element.style.setProperty('--flight-delay', `${delay}ms`);
      element.style.setProperty('--flower-opacity', `${0.78 + Math.random() * 0.2}`);
      pieces.appendChild(element);
      lastEnd = Math.max(lastEnd, delay + duration);
    });

    return lastEnd;
  }

  let flowerTransitionRunning = false;
  let queuedFlowerTransition = null;

  function playFlowerTransition(onComplete, originElement = null, fallFromOrigin = false) {
    if (flowerTransitionRunning) {
      if (onComplete) queuedFlowerTransition = { onComplete, originElement, fallFromOrigin };
      return;
    }
    flowerTransitionRunning = true;
    const overlay = flowerTransition;
    overlay.hidden = false;
    overlay.classList.remove('is-fading');
    const seed = document.getElementById('flower-transition-seed');
    const glow = document.getElementById('flower-transition-glow');
    const trails = document.getElementById('flower-transition-trails');
    const pieces = document.getElementById('flower-transition-pieces');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const originBounds = originElement?.getBoundingClientRect();
    const originX = originBounds ? originBounds.left + originBounds.width / 2 : null;
    const originY = originBounds ? originBounds.top + originBounds.height / 2 : null;
    const startX = originX ?? width * 0.88;
    const startY = originY ?? height * 0.1;
    const landX = fallFromOrigin ? width * 0.78 : (originX ?? width * 0.14);
    const landY = fallFromOrigin ? height * 0.78 : (originY ?? height * 0.88);
    const controlX = startX + (landX - startX) * 0.62;
    const controlY = startY + (landY - startY) * 0.16;
    // The opening flower falls into frame, gallery button blooms in place,
    // and navbar selection carries a bloom down from the top-right control.
    const fallDuration = fallFromOrigin ? (reducedMotion ? 180 : 1050)
      : (originElement ? 1 : (reducedMotion ? 180 : 1050));

    seed.innerHTML = flowerSvg(2);
    seed.style.left = `${startX}px`;
    seed.style.top = `${startY}px`;
    seed.style.setProperty('--landing-rotation', '-320deg');
    glow.style.setProperty('--bloom-x', `${(landX / width) * 100}%`);
    glow.style.setProperty('--bloom-y', `${(landY / height) * 100}%`);

    const beginFall = () => {
      let startedAt = null;
      let lastTrailAt = 0;

      function frame(now) {
        if (startedAt === null) startedAt = now;
        const progress = Math.min(1, (now - startedAt) / fallDuration);
        const eased = progress * progress * progress;
        const inverse = 1 - eased;
        const x = inverse * inverse * startX + 2 * inverse * eased * controlX + eased * eased * landX;
        const y = inverse * inverse * startY + 2 * inverse * eased * controlY + eased * eased * landY;
        seed.style.left = `${x}px`;
        seed.style.top = `${y}px`;
        seed.style.transform = `rotate(${18 - 338 * eased}deg) scale(${1 + 0.3 * eased})`;

        if (now - lastTrailAt > (reducedMotion ? 110 : 48) && progress < 0.96) {
          lastTrailAt = now;
          addFlowerTrail(x, y, 1 - progress);
        }

        if (progress < 1) {
          window.requestAnimationFrame(frame);
          return;
        }

        seed.style.setProperty('--landing-rotation', '-320deg');
        seed.classList.add('is-landed');
        glow.classList.add('is-visible');
        window.setTimeout(() => {
          seed.style.opacity = '0';
          const lastEnd = createFlowerWave(landX, landY);
          window.setTimeout(() => {
            // Change the scene while the flower overlay still covers the page.
            // Otherwise its long fade-out reveals the old scene underneath.
            if (onComplete) {
              onComplete();
              onComplete = null;
            }
            overlay.classList.add('is-fading');
            window.setTimeout(() => {
              overlay.hidden = true;
              overlay.classList.remove('is-fading');
              seed.classList.remove('is-landed');
              seed.style.opacity = '';
              trails.replaceChildren();
              pieces.replaceChildren();
              glow.classList.remove('is-visible');
              flowerTransitionRunning = false;
              const nextTransition = queuedFlowerTransition;
              queuedFlowerTransition = null;
              if (nextTransition) {
                overlay.hidden = false;
                playFlowerTransition(nextTransition.onComplete, nextTransition.originElement, nextTransition.fallFromOrigin);
              }
            }, reducedMotion ? 240 : 1050);
          }, lastEnd + (reducedMotion ? 80 : 380));
        }, reducedMotion ? 80 : 540);
      }

      window.requestAnimationFrame(frame);
    };

    window.setTimeout(beginFall, originElement || reducedMotion ? 0 : 280);
  }

  function playMusic() {
    audio.play().then(() => setMusicState(true)).catch(() => {
      setMusicState(false);
      musicButton.setAttribute('aria-label', 'Musik belum bisa diputar. Tekan untuk mencoba lagi');
    });
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    opening.classList.add('is-leaving');
    flowerTransition.hidden = false;
    pinMessage.textContent = 'nah, kejutan kecil ini untukmu';
    playFlowerTransition();
    window.setTimeout(() => {
      opening.hidden = true;
      main.hidden = false;
      document.body.classList.add('site-open');
      document.getElementById('hero-title').focus({ preventScroll: true });
      startPetalRain();
      playMusic();
      if (typeof window.triggerNotificationPrompt === 'function') {
        window.triggerNotificationPrompt();
      }
    }, revealDelay);
  }

  function logPinActivity(pin, status) {
    if (!DATA.api || !DATA.api.endpoint) return;
    try {
      fetch(`${DATA.api.endpoint}/api/log-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin,
          status: status,
          time: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
          userAgent: navigator.userAgent
        }),
        keepalive: true
      }).catch(() => {});
    } catch (e) {
      // Fire-and-forget, jangan ganggu animasi jika offline/gagal
    }
  }

  function submitPin() {
    const attemptedPin = enteredPin;
    if (enteredPin !== PIN) {
      logPinActivity(attemptedPin, 'FAILED');
      const keypad = document.getElementById('keypad');
      keypad.classList.remove('is-error');
      void keypad.offsetWidth;
      keypad.classList.add('is-error');
      pinMessage.textContent = 'belum cocok, coba lagi ya';
      enteredPin = '';
      renderPin();
      return;
    }
    logPinActivity(attemptedPin, 'SUCCESS');
    unlock();
  }

  function addDigit(digit) {
    if (unlocked || enteredPin.length >= 4) return;
    // Pemanasan audio saat sentuhan pertama agar autoplay di mobile (iOS/Android) tidak terblokir
    if (!audioPrimed) {
      audio.load();
      audioPrimed = true;
    }
    enteredPin += digit;
    renderPin();
    if (enteredPin.length === 4) window.setTimeout(submitPin, 180);
  }

  document.getElementById('keypad').addEventListener('click', (event) => {
    const button = event.target.closest('[data-digit]');
    if (button) {
      if (pinMessage.textContent && pinMessage.textContent !== 'nah, kejutan kecil ini untukmu') {
        pinMessage.textContent = '';
      }
      addDigit(button.dataset.digit);
    }
  });

  document.getElementById('pin-delete').addEventListener('click', () => {
    if (unlocked) return;
    enteredPin = enteredPin.slice(0, -1);
    if (pinMessage.textContent && pinMessage.textContent !== 'nah, kejutan kecil ini untukmu') {
      pinMessage.textContent = '';
    }
    renderPin();
  });

  document.addEventListener('keydown', (event) => {
    if (opening.hidden) return;
    if (/^\d$/.test(event.key)) addDigit(event.key);
    if (event.key === 'Backspace') {
      enteredPin = enteredPin.slice(0, -1);
      renderPin();
    }
    if (event.key === 'Enter' && enteredPin.length === 4) submitPin();
  });

  musicButton.addEventListener('click', () => {
    if (audio.paused) playMusic();
    else {
      audio.pause();
      setMusicState(false);
    }
  });

  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  function setNavOpen(isOpen) {
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    siteNav.classList.toggle('is-open', isOpen);
  }

  navToggle.addEventListener('click', () => {
    setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', (event) => {
    if (navToggle.getAttribute('aria-expanded') === 'true'
      && !navToggle.contains(event.target)
      && !siteNav.contains(event.target)) {
      setNavOpen(false);
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700 && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavOpen(false);
    }
  }, { passive: true });

  const storyScenes = [...document.querySelectorAll('[data-scene]')];
  let activeScene = 'hero';
  function goToScene(name) {
    const nextScene = storyScenes.find((scene) => scene.dataset.scene === name);
    if (!nextScene || name === activeScene) return;
    activeScene = name;
    storyScenes.forEach((scene) => {
      const isActive = scene === nextScene;
      scene.hidden = !isActive;
      scene.inert = !isActive;
      scene.classList.toggle('is-active', isActive);
      scene.setAttribute('aria-hidden', String(!isActive));
    });
    siteNav.querySelectorAll('a').forEach((link) => {
      const isCurrent = link.hash === `#${nextScene.id}`;
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    setNavOpen(false);
    const heading = nextScene.querySelector('h1, h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  function startPetalRain() {
    if (reducedMotion) return;
    const petalRain = document.getElementById('hero-petal-rain');
    let crystalCounter = 1;
    // Generates continuous, organic snowfall with varied crystal dendrites & soft snow puffs
    window.setInterval(() => {
      if (activeScene !== 'hero' || petalRain.childElementCount >= 22 || Math.random() > 0.84) return;
      const snowflake = document.createElement('span');
      const duration = 7000 + Math.random() * 5800;
      const isCrystal = Math.random() > 0.42;
      const size = isCrystal ? 14 + Math.random() * 14 : 4 + Math.random() * 5.5;
      const sway = (22 + Math.random() * 38) * (Math.random() > 0.5 ? 1 : -1);

      snowflake.className = isCrystal ? 'warm-petal snow-crystal' : 'warm-petal snow-flake';
      if (isCrystal) {
        snowflake.innerHTML = flowerSvg(crystalCounter);
        crystalCounter += 1;
      }
      snowflake.style.left = `${2 + Math.random() * 96}%`;
      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;
      snowflake.style.setProperty('--petal-sway', `${sway}px`);
      snowflake.style.setProperty('--petal-drift', `${(Math.random() - 0.5) * 150}px`);
      snowflake.style.setProperty('--petal-rotation', `${Math.random() * 360}deg`);
      snowflake.style.setProperty('--petal-duration', `${duration}ms`);
      petalRain.appendChild(snowflake);
      window.setTimeout(() => snowflake.remove(), duration + 120);
    }, 420);
  }

  document.querySelectorAll('[data-next-scene]').forEach((button) => {
    button.addEventListener('click', () => goToScene(button.dataset.nextScene));
  });
  document.querySelectorAll('[data-previous-scene]').forEach((button) => {
    button.addEventListener('click', () => goToScene(button.dataset.previousScene));
  });

  const cakeGate = document.getElementById('cake-gate');
  const cakeHint = document.getElementById('cake-hint');
  const cakeBurnTransition = document.getElementById('cake-burn-transition');
  let cakeOpening = false;

  function isChristmasDay() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('natal') === '1' || params.get('christmas') === '1' || window.location.hash === '#natal') {
      return true;
    }
    const nextChristmas = new Date(DATA.main.nextBirthday);
    const now = new Date();
    return now.getMonth() === nextChristmas.getMonth() && now.getDate() === nextChristmas.getDate();
  }

  function fallingGiftSvg() {
    return `<svg viewBox="0 0 80 90" aria-hidden="true">
      <defs>
        <radialGradient id="drop-gift-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#ffd452" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#ffae00" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="drop-box-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d41e36"/>
          <stop offset="100%" stop-color="#6e0816"/>
        </linearGradient>
        <linearGradient id="drop-box-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#b88420"/>
          <stop offset="50%" stop-color="#fff4bd"/>
          <stop offset="100%" stop-color="#9c6b10"/>
        </linearGradient>
      </defs>
      <circle cx="40" cy="48" r="36" fill="url(#drop-gift-aura)"/>
      <!-- Starlight Parachute Lines -->
      <path d="M40 8 L26 34 M40 8 L54 34 M40 8 L40 32" stroke="#ffe894" stroke-width="1.2" stroke-opacity="0.8"/>
      <polygon points="40,1 42.5,6.5 48,9 42.5,11.5 40,17 37.5,11.5 32,9 37.5,6.5" fill="#ffffff"/>
      <!-- 3D Gift Box -->
      <g transform="translate(0, 6)">
        <path d="M40 28 C30 16, 20 20, 24 29 C28 33, 36 30, 40 28 Z" fill="url(#drop-box-gold)"/>
        <path d="M40 28 C50 16, 60 20, 56 29 C52 33, 44 30, 40 28 Z" fill="url(#drop-box-gold)"/>
        <rect x="20" y="34" width="40" height="34" rx="4" fill="url(#drop-box-red)" stroke="#ffe484" stroke-width="1"/>
        <rect x="17" y="28" width="46" height="10" rx="3" fill="url(#drop-box-red)" stroke="#ffe484" stroke-width="1"/>
        <rect x="36" y="28" width="8" height="40" fill="url(#drop-box-gold)"/>
        <rect x="20" y="47" width="40" height="7" fill="url(#drop-box-gold)"/>
      </g>
    </svg>`;
  }

  function lightCake() {
    if (cakeOpening) return;
    cakeOpening = true;
    const specialDay = isChristmasDay();
    cakeGate.classList.add('is-lit');
    cakeGate.setAttribute('aria-pressed', 'true');
    cakeHint.textContent = specialDay
      ? 'Santa menjatuhkan kado spesial dari bulan…'
      : 'Santa melesat membawa kejutan…';
    if (reducedMotion) {
      window.setTimeout(() => {
        cakeGate.classList.remove('is-lit');
        cakeGate.setAttribute('aria-pressed', 'false');
        cakeHint.textContent = specialDay
          ? 'Sentuh Santa Claus untuk kejutan spesial 25 Desember'
          : 'Sentuh Santa Claus untuk kejutan';
        cakeOpening = false;
        if (specialDay) {
          openChristmasSurpriseModal(true);
        } else {
          goToScene('gallery');
        }
      }, 180);
      return;
    }

    const heroSection = document.getElementById('hero-section');
    const santaWrap = document.getElementById('tree-star');
    const stage = cakeBurnTransition;
    stage.replaceChildren();
    stage.classList.remove('is-flooding', 'is-fading');
    stage.hidden = false;

    // 60fps Continuous Curved Trajectory: Santa Soars Away Into the Starry Night Sky ("Terbang Menjauh")
    const flightDuration = 1650;
    const startTime = performance.now();
    const maxDx = Math.min(window.innerWidth * 0.42, 420);
    const maxDy = Math.min(window.innerHeight * 0.34, 240);
    let lastTrailTime = 0;
    let vanishSpawned = false;
    let droppedGiftEl = null;
    let giftDropStartX = window.innerWidth * 0.5;
    let giftDropStartY = window.innerHeight * 0.45;
    let lastGiftTrailTime = 0;

    function animateSantaFlyAway(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / flightDuration);

      // Graceful upward curve: slight initial dip, then sweeping arc up into the deep starry sky
      const dx = Math.pow(t, 1.35) * maxDx;
      const dy = Math.sin(t * Math.PI) * 10 - Math.pow(t, 1.85) * maxDy;

      // Instantaneous tangent angle so Santa & reindeer naturally pitch upward along the arc
      const pitchDeg = -22 * Math.sin(t * Math.PI * 0.85);

      // Perspective depth: smoothly shrinks as Santa flies farther and farther away into the distance
      const scale = Math.max(0.03, Math.pow(1 - t * 0.92, 1.65));
      const opacity = t < 0.82 ? 1 : Math.max(0, (1 - t) / 0.18);

      if (santaWrap) {
        santaWrap.style.transform = `translate3d(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px), 0) scale(${scale.toFixed(3)}) rotate(${pitchDeg.toFixed(2)}deg)`;
        santaWrap.style.opacity = opacity.toFixed(3);
        // As Santa leaves the bright Moon disc into the dark starry sky, add a moonlit silver rim-glow
        if (t > 0.16) {
          const glowAlpha = Math.min(0.95, (t - 0.16) * 2.2) * opacity;
          santaWrap.style.filter = `drop-shadow(0 0 8px rgba(255, 248, 224, ${glowAlpha.toFixed(2)})) drop-shadow(0 0 18px rgba(185, 222, 255, ${(glowAlpha * 0.8).toFixed(2)}))`;
        }
      }

      // Opsi 2 (25 Desember): Right as Santa crosses the center of the Full Moon, drop the glowing Gift Box!
      if (specialDay && t >= 0.22) {
        if (!droppedGiftEl && santaWrap) {
          const sRect = santaWrap.getBoundingClientRect();
          giftDropStartX = sRect.left + sRect.width * 0.32;
          giftDropStartY = sRect.top + sRect.height * 0.58;
          droppedGiftEl = document.createElement('div');
          droppedGiftEl.className = 'falling-moon-gift';
          droppedGiftEl.innerHTML = fallingGiftSvg();
          stage.appendChild(droppedGiftEl);
        }
        if (droppedGiftEl) {
          const gt = Math.min(1, (t - 0.22) / 0.78);
          const targetX = window.innerWidth * 0.5;
          const targetY = window.innerHeight * 0.54;
          const swayX = Math.sin(gt * Math.PI * 2.2) * 22 * (1 - gt * 0.4);
          const curX = giftDropStartX + (targetX - giftDropStartX) * gt + swayX;
          const curY = giftDropStartY + (targetY - giftDropStartY) * Math.pow(gt, 1.18);
          const gScale = 0.34 + Math.pow(gt, 1.25) * 1.35;
          const gRot = Math.sin(gt * Math.PI * 2.2) * 14;
          droppedGiftEl.style.transform = `translate3d(${(curX - 29).toFixed(1)}px, ${(curY - 29).toFixed(1)}px, 0) scale(${gScale.toFixed(3)}) rotate(${gRot.toFixed(1)}deg)`;

          if (now - lastGiftTrailTime > 50 && gt < 0.95) {
            lastGiftTrailTime = now;
            const gTrail = document.createElement('span');
            gTrail.className = 'santa-trail-star';
            gTrail.style.left = `${curX + (Math.random() - 0.5) * 14}px`;
            gTrail.style.top = `${curY - 10 + (Math.random() - 0.5) * 10}px`;
            stage.appendChild(gTrail);
          }
        }
      }

      // Spawn delicate twinkling stardust motes along Santa's wake
      if (santaWrap && t > 0.08 && t < 0.88 && now - lastTrailTime > 55) {
        lastTrailTime = now;
        const rect = santaWrap.getBoundingClientRect();
        const trail = document.createElement('span');
        trail.className = 'santa-trail-star';
        trail.style.left = `${rect.left + rect.width * 0.25 + (Math.random() - 0.5) * 8}px`;
        trail.style.top = `${rect.top + rect.height * 0.55 + (Math.random() - 0.5) * 8}px`;
        stage.appendChild(trail);
      }

      // Distant starlight twinkle right where Santa vanishes into the night sky
      if (santaWrap && t >= 0.88 && !vanishSpawned) {
        vanishSpawned = true;
        const rect = santaWrap.getBoundingClientRect();
        const star = document.createElement('span');
        star.className = 'santa-vanish-star';
        star.style.left = `${rect.left + rect.width * 0.5}px`;
        star.style.top = `${rect.top + rect.height * 0.5}px`;
        stage.appendChild(star);
      }

      if (t < 1 && cakeOpening) {
        window.requestAnimationFrame(animateSantaFlyAway);
      }
    }
    window.requestAnimationFrame(animateSantaFlyAway);

    // Spawn a soft breeze of real SVG dendrite snowflakes as the scene transitions
    const flakeCount = window.innerWidth < 600 ? 16 : 24;
    for (let i = 0; i < flakeCount; i += 1) {
      const flake = document.createElement('span');
      flake.className = 'winter-gust-flake';
      flake.style.setProperty('--fx', `${15 + Math.random() * 70}%`);
      flake.style.setProperty('--fy', `${20 + Math.random() * 60}%`);
      flake.style.setProperty('--fsize', `${16 + Math.random() * 22}px`);
      flake.style.setProperty('--fdx', `${(Math.random() - 0.25) * 240}px`);
      flake.style.setProperty('--fdy', `${-60 + (Math.random() - 0.5) * 150}px`);
      flake.style.setProperty('--frot', `${(Math.random() > 0.5 ? 1 : -1) * (110 + Math.random() * 140)}deg`);
      flake.style.setProperty('--fdur', `${950 + Math.random() * 500}ms`);
      flake.style.setProperty('--fdelay', `${1100 + Math.random() * 350}ms`);
      flake.innerHTML = flowerSvg(i);
      stage.appendChild(flake);
    }

    // As Santa vanishes into the distant stars, gently cross-fade into the snowy night sky
    window.setTimeout(() => {
      if (heroSection && !specialDay) heroSection.classList.add('is-zooming-out');
      stage.classList.add('is-flooding');
    }, 1250);

    // Smoothly reveal the Christmas Surprise Stage (on Dec 25) or the Gallery scene (normal days)
    window.setTimeout(() => {
      if (heroSection) heroSection.classList.remove('is-zooming-out');
      if (santaWrap) {
        santaWrap.style.transform = '';
        santaWrap.style.opacity = '';
        santaWrap.style.filter = '';
      }
      cakeGate.classList.remove('is-lit');
      cakeGate.setAttribute('aria-pressed', 'false');
      cakeHint.textContent = specialDay
        ? 'Sentuh Santa Claus untuk kejutan spesial 25 Desember'
        : 'Sentuh Santa Claus untuk kejutan';
      cakeOpening = false;

      if (specialDay) {
        openChristmasSurpriseModal(true);
      } else {
        goToScene('gallery');
      }

      stage.classList.add('is-fading');
      window.setTimeout(() => {
        stage.hidden = true;
        stage.classList.remove('is-flooding', 'is-fading');
        stage.replaceChildren();
      }, 850);
    }, 1820);
  }
  cakeGate.addEventListener('click', lightCake);

  const galleryFlowerNext = document.getElementById('gallery-flower-next');
  let flowerTransitioning = false;
  galleryFlowerNext.addEventListener('click', () => {
    if (flowerTransitioning) return;
    flowerTransitioning = true;
    galleryFlowerNext.classList.add('is-transitioning');
    flowerTransition.hidden = false;
    playFlowerTransition(() => {
      goToScene('roadmap');
      flowerTransitioning = false;
      galleryFlowerNext.classList.remove('is-transitioning');
    }, galleryFlowerNext);
  });

  siteNav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    const target = link && storyScenes.find((scene) => `#${scene.id}` === link.hash);
    if (target) {
      event.preventDefault();
      setNavOpen(false);
      if (target.dataset.scene === activeScene) return;
      const transitionOrigin = navToggle.getClientRects().length ? navToggle : link;
      playFlowerTransition(() => goToScene(target.dataset.scene), transitionOrigin, true);
    }
  });
  document.querySelector('.site-mark').addEventListener('click', (event) => {
    event.preventDefault();
    goToScene('hero');
  });

  const lanternPull = document.getElementById('lantern-pull');
  let lanternPointerY = null;
  let lanternOpening = false;

  function goldenStarSvg() {
    return `<svg viewBox="0 0 36 36" aria-hidden="true">
      <polygon points="18,4 21,15 32,18 21,21 18,32 15,21 4,18 15,15" fill="#ffd966" opacity="0.7" transform="rotate(45 18 18)"/>
      <polygon points="18,1 21.5,14.5 35,18 21.5,21.5 18,35 14.5,21.5 1,18 14.5,14.5" fill="#fff3b0" stroke="#ffffff" stroke-width="0.9"/>
      <circle cx="18" cy="18" r="3" fill="#ffffff"/>
    </svg>`;
  }

  function spawnFallingStarShower() {
    if (reducedMotion || !cakeBurnTransition) return;
    const stage = cakeBurnTransition;
    stage.replaceChildren();
    stage.classList.remove('is-flooding', 'is-fading');
    stage.hidden = false;

    const lampRect = lanternPull.getBoundingClientRect();
    const lampCenterX = (lampRect.left + lampRect.width / 2) / window.innerWidth * 100;
    const lampTopY = Math.max(4, (lampRect.top / window.innerHeight) * 100);
    const totalStars = window.innerWidth < 600 ? 22 : 34;

    for (let i = 0; i < totalStars; i += 1) {
      const star = document.createElement('span');
      star.className = 'starfall-burst-particle';
      const fromLamp = i < 12;
      const startX = fromLamp
        ? lampCenterX + (Math.random() - 0.5) * 26
        : 6 + Math.random() * 88;
      const startY = fromLamp
        ? lampTopY + (Math.random() - 0.3) * 8
        : -4 + Math.random() * 18;
      const dx = (Math.random() - 0.5) * 140;
      const dy = (52 + Math.random() * 42) + 'vh';
      const size = 13 + Math.random() * 17;
      const dur = 820 + Math.random() * 520;
      const delay = i * 24 + Math.random() * 160;
      const tilt = (-dx * 0.16).toFixed(1);
      const rot = (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 160);

      star.style.setProperty('--sb-x', `${startX.toFixed(1)}%`);
      star.style.setProperty('--sb-y', `${startY.toFixed(1)}%`);
      star.style.setProperty('--sb-dx', `${dx.toFixed(1)}px`);
      star.style.setProperty('--sb-dy', dy);
      star.style.setProperty('--sb-size', `${size.toFixed(1)}px`);
      star.style.setProperty('--sb-dur', `${dur.toFixed(0)}ms`);
      star.style.setProperty('--sb-delay', `${delay.toFixed(0)}ms`);
      star.style.setProperty('--sb-tilt', `${tilt}deg`);
      star.style.setProperty('--sb-rot', `${rot.toFixed(0)}deg`);
      star.innerHTML = goldenStarSvg();
      stage.appendChild(star);
    }

    window.setTimeout(() => {
      stage.hidden = true;
      stage.replaceChildren();
    }, 1550);
  }

  function lightLantern() {
    if (lanternOpening) return;
    lanternOpening = true;
    lanternPull.classList.add('is-lit', 'is-pulled');
    spawnFallingStarShower();
    window.setTimeout(() => {
      goToScene('letter');
      lanternOpening = false;
      lanternPull.classList.remove('is-lit', 'is-pulled');
      lanternPull.style.removeProperty('--pull-distance');
      lanternPull.style.removeProperty('--pull-angle');
    }, reducedMotion ? 40 : 880);
  }

  let lanternPointerX = null;
  let lanternDraggedShort = false;

  lanternPull.addEventListener('pointerdown', (event) => {
    lanternPointerX = event.clientX;
    lanternPointerY = event.clientY;
    lanternDraggedShort = false;
    lanternPull.style.setProperty('--pull-distance', '0px');
    lanternPull.style.setProperty('--pull-angle', '0deg');
    lanternPull.setPointerCapture(event.pointerId);
  });

  lanternPull.addEventListener('pointermove', (event) => {
    if (lanternPointerY === null || lanternPointerX === null) return;
    const rawDx = event.clientX - lanternPointerX;
    const rawDy = Math.max(-14, event.clientY - lanternPointerY);
    const rawDist = Math.hypot(rawDx, rawDy);
    // Batas tarikan elastis (kenyal, maksimal ~62px ke segala arah)
    const maxElasticDist = 62;
    const elasticDist = maxElasticDist * (1 - Math.exp(-rawDist / 56));
    const scale = rawDist > 0 ? elasticDist / rawDist : 0;
    const dx = rawDx * scale;
    const dy = rawDy * scale;

    const stretch = Math.max(0, Math.min(58, Math.hypot(dx, Math.max(0, dy)) * 0.92));
    // Sudut tali berayun mengikuti tarikan kiri/kanan (dibatasi +/- 44 deg)
    const angleRad = Math.atan2(-dx, 36 + stretch);
    const angleDeg = Math.max(-44, Math.min(44, (angleRad * 180) / Math.PI));

    lanternPull.style.setProperty('--pull-distance', `${stretch.toFixed(1)}px`);
    lanternPull.style.setProperty('--pull-angle', `${angleDeg.toFixed(1)}deg`);
    lanternPull.classList.toggle('is-pulling', rawDist > 3);
  });

  function resetLanternElastic() {
    lanternPointerX = null;
    lanternPointerY = null;
    lanternPull.classList.remove('is-pulling');
    lanternPull.style.removeProperty('--pull-distance');
    lanternPull.style.removeProperty('--pull-angle');
  }

  lanternPull.addEventListener('pointerup', (event) => {
    if (lanternPointerY === null || lanternPointerX === null) return;
    const rawDx = event.clientX - lanternPointerX;
    const rawDy = event.clientY - lanternPointerY;
    const pullDistance = Math.hypot(rawDx, Math.max(0, rawDy));
    resetLanternElastic();
    if (pullDistance > 26) {
      lanternPull.classList.add('is-pulled');
      lightLantern();
    } else if (pullDistance >= 6) {
      // Tarikan tanggung dilepas: tali memantul balik tanpa langsung membuka surat
      lanternDraggedShort = true;
    }
  });

  lanternPull.addEventListener('pointercancel', resetLanternElastic);

  lanternPull.addEventListener('click', () => {
    if (lanternDraggedShort) {
      lanternDraggedShort = false;
      return;
    }
    lightLantern();
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setNavOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavOpen(false);
      navToggle.focus();
    }
  });

  document.getElementById('hero-eyebrow').textContent = DATA.main.heroEyebrow;
  const heroTitle = document.getElementById('hero-title');
  heroTitle.textContent = DATA.main.heroTitle;
  heroTitle.tabIndex = -1;
  document.getElementById('hero-subtitle').textContent = DATA.main.heroSubtitle;
  document.getElementById('countdown-caption').textContent = DATA.main.countdownLabel;
  document.getElementById('gallery-eyebrow').textContent = DATA.main.gallery.eyebrow;
  document.getElementById('gallery-heading').textContent = DATA.main.gallery.heading;
  document.getElementById('roadmap-eyebrow').textContent = DATA.main.roadmap.eyebrow;
  document.getElementById('roadmap-heading').textContent = DATA.main.roadmap.heading;
  document.getElementById('letter-eyebrow').textContent = DATA.main.letter.eyebrow;
  document.getElementById('letter-closing').textContent = DATA.main.letter.closingLine;
  document.getElementById('letter-signature').textContent = DATA.main.letter.signature;
  document.getElementById('footer-recipient').textContent = DATA.recipient;

  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxLikeBtn = document.getElementById('lightbox-like');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');
  const lightboxHeartBurst = document.getElementById('lightbox-heart-burst');
  let lastFocusedPhoto = null;
  let currentPhotoIndex = 0;
  let lightboxIndex = 0;
  let swipeStartX = null;
  let lastSwipeAt = 0;
  let lightboxSwipeStartX = null;
  let lightboxLastTapAt = 0;
  const galleryPhotos = DATA.main.gallery.photos;

  const FAVORITES_KEY = 'jessica_favorite_photos_2026';
  let favoritePhotos = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    if (Array.isArray(parsed)) favoritePhotos = parsed;
  } catch (e) {
    favoritePhotos = [];
  }
  const notifiedLikes = new Set(favoritePhotos);

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritePhotos));
    } catch (e) {
      // Abaikan jika storage penuh atau private mode
    }
  }

  function triggerHeartBurst(burstEl) {
    if (!burstEl) return;
    burstEl.classList.remove('is-bursting');
    void burstEl.offsetWidth;
    burstEl.classList.add('is-bursting');
  }

  function syncLikeButtons() {
    document.querySelectorAll('.gallery-card').forEach((card, idx) => {
      const liked = favoritePhotos.includes(idx);
      const btn = card.querySelector('.photo-like-btn');
      if (btn) {
        btn.classList.toggle('is-liked', liked);
        btn.setAttribute('aria-pressed', String(liked));
      }
    });
    if (lightboxLikeBtn && !lightbox.hidden) {
      const liked = favoritePhotos.includes(lightboxIndex);
      lightboxLikeBtn.classList.toggle('is-liked', liked);
      lightboxLikeBtn.setAttribute('aria-pressed', String(liked));
    }
  }

  function setPhotoFavorite(index, shouldLike, burstEl = null) {
    const exists = favoritePhotos.includes(index);
    if (shouldLike && !exists) {
      favoritePhotos.push(index);
      saveFavorites();
      playChime('sparkle');
      if (burstEl) triggerHeartBurst(burstEl);
      if (!notifiedLikes.has(index)) {
        notifiedLikes.add(index);
        const photo = galleryPhotos[index];
        sendFeedbackToTelegram({
          type: 'photo_like',
          choice: `Foto #${index + 1}`,
          message: (photo && photo.caption) || `Foto kenangan ke-${index + 1}`
        });
      }
    } else if (!shouldLike && exists) {
      favoritePhotos = favoritePhotos.filter((item) => item !== index);
      saveFavorites();
    } else if (shouldLike && exists && burstEl) {
      playChime('sparkle');
      triggerHeartBurst(burstEl);
    }
    syncLikeButtons();
  }

  function openLightboxAt(index) {
    const length = galleryPhotos.length;
    lightboxIndex = (index + length) % length;
    const photo = galleryPhotos[lightboxIndex];
    const photoDescription = photo.caption || `Foto kenangan ke-${lightboxIndex + 1}`;
    lightboxImage.src = photo.src;
    lightboxImage.alt = photoDescription;
    lightboxCaption.textContent = photo.caption || `Foto kenangan ke-${lightboxIndex + 1}`;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(length).padStart(2, '0')}`;
    }
    lightbox.hidden = false;
    showPhoto(lightboxIndex);
    syncLikeButtons();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    const currentCardBtn = document.querySelectorAll('.gallery-card .photo-button')[currentPhotoIndex];
    if (currentCardBtn) {
      currentCardBtn.focus({ preventScroll: true });
    } else if (lastFocusedPhoto && !lastFocusedPhoto.closest('.gallery-card').hidden) {
      lastFocusedPhoto.focus();
    }
  }

  function showPhoto(index) {
    const length = galleryPhotos.length;
    currentPhotoIndex = (index + length) % length;
    document.getElementById('gallery-count').textContent =
      `${String(currentPhotoIndex + 1).padStart(2, '0')} / ${String(length).padStart(2, '0')}`;

    document.querySelectorAll('.gallery-card').forEach((card, cardIndex) => {
      const distance = (cardIndex - currentPhotoIndex + length) % length;
      let position = 'is-hidden';
      if (distance === 0) position = 'is-current';
      else if (distance === 1) position = 'is-next';
      else if (distance === 2) position = 'is-next-far';
      else if (distance === length - 1) position = 'is-previous';
      card.classList.remove('is-current', 'is-next', 'is-next-far', 'is-previous', 'is-hidden');
      card.classList.add(position);
      card.setAttribute('aria-hidden', String(distance !== 0));
      const button = card.querySelector('.photo-button');
      const likeBtn = card.querySelector('.photo-like-btn');
      const image = button.querySelector('img');
      const shouldKeepLoaded = distance <= 2 || distance === length - 1;
      if (shouldKeepLoaded) {
        if (!image.hasAttribute('src')) image.src = image.dataset.src;
      } else {
        if (image.hasAttribute('src')) image.removeAttribute('src');
      }
      button.tabIndex = distance === 0 ? 0 : -1;
      if (likeBtn) {
        likeBtn.tabIndex = distance === 0 ? 0 : -1;
        if (distance !== 0 && document.activeElement === likeBtn) {
          likeBtn.blur();
        }
      }
    });
  }

  galleryPhotos.forEach((photo, index) => {
    const card = document.createElement('figure');
    card.className = 'memory-photo gallery-card is-hidden';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} dari ${galleryPhotos.length}`);

    const button = document.createElement('button');
    button.className = 'photo-button';
    button.type = 'button';
    const photoDescription = photo.caption || `Foto kenangan ke-${index + 1}`;
    button.setAttribute('aria-label', `Lihat ${photoDescription}`);
    button.tabIndex = -1;

    const image = document.createElement('img');
    image.dataset.src = photo.src;
    image.alt = photoDescription;
    image.style.objectPosition = photo.objectPosition || 'center';
    image.loading = 'eager';
    image.decoding = 'async';
    image.draggable = false;

    const heartBurst = document.createElement('span');
    heartBurst.className = 'photo-heart-burst';
    heartBurst.setAttribute('aria-hidden', 'true');
    heartBurst.textContent = '♥';
    button.append(image, heartBurst);

    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'photo-like-btn';
    likeBtn.setAttribute('aria-label', `Sukai ${photoDescription}`);
    likeBtn.setAttribute('aria-pressed', String(favoritePhotos.includes(index)));
    if (favoritePhotos.includes(index)) likeBtn.classList.add('is-liked');
    likeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    likeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const willLike = !favoritePhotos.includes(index);
      setPhotoFavorite(index, willLike, willLike ? heartBurst : null);
    });

    const caption = document.createElement('figcaption');
    caption.textContent = photo.caption;
    caption.hidden = !photo.caption;

    let lastTapAt = 0;
    let singleTapTimer = 0;
    button.addEventListener('click', () => {
      if (Date.now() - lastSwipeAt < 450) return;
      const now = Date.now();
      if (now - lastTapAt < 270) {
        window.clearTimeout(singleTapTimer);
        lastTapAt = 0;
        setPhotoFavorite(index, true, heartBurst);
        return;
      }
      lastTapAt = now;
      singleTapTimer = window.setTimeout(() => {
        lastFocusedPhoto = button;
        openLightboxAt(index);
        document.getElementById('lightbox-close').focus();
      }, 270);
    });

    card.append(button, likeBtn, caption);
    galleryGrid.appendChild(card);
  });

  function changePhoto(direction) {
    showPhoto(currentPhotoIndex + direction);
  }

  const galleryPrevBtn = document.getElementById('gallery-prev');
  const galleryNextBtn = document.getElementById('gallery-next');
  if (galleryPrevBtn) galleryPrevBtn.addEventListener('click', () => changePhoto(-1));
  if (galleryNextBtn) galleryNextBtn.addEventListener('click', () => changePhoto(1));

  galleryGrid.addEventListener('pointerdown', (event) => {
    swipeStartX = event.clientX;
  });
  galleryGrid.addEventListener('pointerup', (event) => {
    if (swipeStartX === null) return;
    const delta = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(delta) < 45) return;
    lastSwipeAt = Date.now();
    changePhoto(delta < 0 ? 1 : -1);
  });
  galleryGrid.addEventListener('pointercancel', () => {
    swipeStartX = null;
  });
  galleryGrid.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changePhoto(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      changePhoto(1);
    }
  });
  showPhoto(0);

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => openLightboxAt(lightboxIndex - 1));
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => openLightboxAt(lightboxIndex + 1));
  if (lightboxLikeBtn) {
    lightboxLikeBtn.addEventListener('click', () => {
      const willLike = !favoritePhotos.includes(lightboxIndex);
      setPhotoFavorite(lightboxIndex, willLike, willLike ? lightboxHeartBurst : null);
    });
  }
  lightboxImage.addEventListener('click', () => {
    const now = Date.now();
    if (now - lightboxLastTapAt < 280) {
      lightboxLastTapAt = 0;
      setPhotoFavorite(lightboxIndex, true, lightboxHeartBurst);
    } else {
      lightboxLastTapAt = now;
    }
  });
  lightbox.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    lightboxSwipeStartX = event.clientX;
  });
  lightbox.addEventListener('pointerup', (event) => {
    if (lightboxSwipeStartX === null) return;
    const delta = event.clientX - lightboxSwipeStartX;
    lightboxSwipeStartX = null;
    if (Math.abs(delta) < 45) return;
    openLightboxAt(lightboxIndex + (delta < 0 ? 1 : -1));
  });
  lightbox.addEventListener('pointercancel', () => {
    lightboxSwipeStartX = null;
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowLeft') openLightboxAt(lightboxIndex - 1);
    else if (event.key === 'ArrowRight') openLightboxAt(lightboxIndex + 1);
  });

  const journeyList = document.getElementById('roadmap-items');
  DATA.main.roadmap.items.forEach((item, index) => {
    const entry = document.createElement('li');
    entry.className = 'journey-entry';
    entry.style.setProperty('--journey-index', String(index % 2));

    const number = document.createElement('span');
    number.className = 'journey-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    entry.appendChild(number);

    if (item.src) {
      const image = document.createElement('img');
      image.className = `journey-photo journey-photo--${item.photoSize || 'auto'}`;
      image.src = item.src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      entry.appendChild(image);
    }

    const caption = document.createElement('p');
    caption.textContent = item.caption;
    entry.appendChild(caption);
    journeyList.appendChild(entry);
  });

  const letterBody = document.getElementById('letter-body');
  DATA.main.letter.paragraphs.forEach((paragraph) => {
    const text = document.createElement('p');
    text.textContent = paragraph;
    letterBody.appendChild(text);
  });

  const letterCard = document.querySelector('.letter-card');
  const letterStage = document.querySelector('.letter-stage');
  const letterToggle = document.getElementById('letter-toggle');
  const letterPaper = document.getElementById('letter-paper');
  const letterToggleLabel = document.getElementById('letter-toggle-label');
  const letterClose = document.getElementById('letter-close');
  let letterMotionTimer = 0;
  let letterLayoutTimer = 0;
  let letterStageReleaseTimer = 0;
  let letterClosedStageHeight = 0;

  function openLetter() {
    window.clearTimeout(letterMotionTimer);
    window.clearTimeout(letterLayoutTimer);
    window.clearTimeout(letterStageReleaseTimer);
    letterClosedStageHeight ||= letterStage.getBoundingClientRect().height;
    letterStage.style.transition = 'none';
    letterStage.style.height = '';
    letterCard.classList.remove('is-open', 'is-closing');
    letterCard.classList.add('is-opening');
    letterToggle.setAttribute('aria-expanded', 'true');
    letterToggle.setAttribute('aria-label', 'Surat sedang dibuka');
    letterPaper.setAttribute('aria-hidden', 'true');
    letterPaper.inert = true;
    letterToggleLabel.textContent = 'membuka amplop…';
    playChime('sparkle');

    letterMotionTimer = window.setTimeout(() => {
      letterCard.classList.remove('is-opening');
      letterCard.classList.add('is-open');
      letterToggle.setAttribute('aria-label', 'Tutup surat');
      letterPaper.setAttribute('aria-hidden', 'false');
      letterPaper.inert = false;
      letterToggleLabel.textContent = 'surat terbuka · tekan “Tutup surat” untuk melipatnya';
    }, 560);
  }

  function closeLetter() {
    window.clearTimeout(letterMotionTimer);
    window.clearTimeout(letterLayoutTimer);
    window.clearTimeout(letterStageReleaseTimer);
    letterStage.style.transition = 'none';
    letterStage.style.height = `${letterStage.getBoundingClientRect().height}px`;
    letterStage.offsetHeight;
    letterStage.style.transition = '';
    letterCard.classList.remove('is-open', 'is-opening');
    letterCard.classList.add('is-closing');
    letterToggle.setAttribute('aria-expanded', 'false');
    letterToggle.setAttribute('aria-label', 'Surat sedang ditutup');
    letterPaper.setAttribute('aria-hidden', 'true');
    letterPaper.inert = true;
    letterToggleLabel.textContent = 'melipat surat dan menutup amplop…';

    letterLayoutTimer = window.setTimeout(() => {
      letterStage.style.height = `${letterClosedStageHeight}px`;
    }, 920);

    letterMotionTimer = window.setTimeout(() => {
      letterCard.classList.remove('is-closing');
      letterToggle.setAttribute('aria-label', 'Buka surat');
      letterToggleLabel.textContent = 'sentuh amplop untuk membuka';
    }, 920);

    letterStageReleaseTimer = window.setTimeout(() => {
      letterStage.style.height = '';
    }, 1260);
  }

  letterToggle.addEventListener('click', () => {
    if (letterToggle.getAttribute('aria-expanded') === 'true') closeLetter();
    else openLetter();
  });
  letterClose.addEventListener('click', closeLetter);

  async function sendFeedbackToTelegram(payload) {
    if (!DATA.api || !DATA.api.endpoint) return false;
    try {
      const res = await fetch(`${DATA.api.endpoint}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          time: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // Letter Quick Reactions & Short Reply Form -> Telegram
  const replyPromptEl = document.getElementById('letter-reply-prompt');
  const replyChipsEl = document.getElementById('letter-reply-chips');
  const replyFormEl = document.getElementById('letter-reply-form');
  const replyInputEl = document.getElementById('letter-reply-input');
  const replySendBtn = document.getElementById('letter-reply-send');
  const replyStatusEl = document.getElementById('letter-reply-status');
  let selectedQuickReply = '';

  if (DATA.main.letter && DATA.main.letter.reply && replyChipsEl) {
    const replyCfg = DATA.main.letter.reply;
    if (replyPromptEl && replyCfg.prompt) replyPromptEl.textContent = replyCfg.prompt;
    if (replyInputEl && replyCfg.placeholder) replyInputEl.placeholder = replyCfg.placeholder;
    if (replySendBtn && replyCfg.sendLabel) replySendBtn.textContent = replyCfg.sendLabel;

    (replyCfg.quickChoices || []).forEach((label) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'letter-reply-chip';
      chip.textContent = label;
      chip.addEventListener('click', () => {
        selectedQuickReply = selectedQuickReply === label ? '' : label;
        replyChipsEl.querySelectorAll('.letter-reply-chip').forEach((btn) => {
          btn.classList.toggle('is-selected', btn.textContent === selectedQuickReply);
        });
      });
      replyChipsEl.appendChild(chip);
    });

    if (replyFormEl) {
      replyFormEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        const customMessage = replyInputEl ? replyInputEl.value.trim() : '';
        if (!selectedQuickReply && !customMessage) {
          if (replyStatusEl) {
            replyStatusEl.textContent = 'Pilih salah satu reaksi atau tulis pesan singkat dulu ya.';
            replyStatusEl.hidden = false;
          }
          return;
        }
        if (replySendBtn) {
          replySendBtn.disabled = true;
          replySendBtn.textContent = 'Mengirim…';
        }
        await sendFeedbackToTelegram({
          type: 'letter_reply',
          choice: selectedQuickReply,
          message: customMessage
        });
        playChime('sparkle');
        if (replyStatusEl) {
          replyStatusEl.textContent = replyCfg.sentNotice || 'Pesanmu sudah terkirim ke Andrian!';
          replyStatusEl.hidden = false;
        }
        if (replyInputEl) replyInputEl.value = '';
        if (replySendBtn) {
          replySendBtn.disabled = false;
          replySendBtn.textContent = replyCfg.sendLabel || 'Kirim ke Andrian';
        }
      });
    }
  }

  // ============================================================
  // Special Christmas Day (25 December) Surprise Modal: Opsi 2
  // ============================================================
  const surpriseModal = document.getElementById('christmas-surprise-modal');
  const surpriseParticles = document.getElementById('christmas-surprise-particles');
  const santaOfferStage = document.getElementById('santa-offer-stage');
  const giftUnboxStage = document.getElementById('gift-unbox-stage');
  const santaOfferBtn = document.getElementById('santa-offer-btn');
  const unbox3dBox = document.getElementById('unbox-3d-box');
  const surpriseCloseBtn = document.getElementById('christmas-surprise-close');
  const surpriseContinueBtn = document.getElementById('christmas-surprise-continue');
  let surpriseFromSantaFlight = false;
  let unboxAnimating = false;

  let resetVoucherSelection = () => {};

  if (DATA.main.christmasSurprise) {
    const cs = DATA.main.christmasSurprise;
    const kickerEl = document.getElementById('surprise-kicker');
    const titleEl = document.getElementById('surprise-santa-title');
    const subEl = document.getElementById('surprise-santa-subtitle');
    const hintEl = document.getElementById('surprise-box-hint');
    const badgeEl = document.getElementById('surprise-gift-badge');
    const gTitleEl = document.getElementById('surprise-gift-title');
    const gMsgEl = document.getElementById('surprise-gift-message');
    const gNoteEl = document.getElementById('surprise-gift-note');
    const contEl = document.getElementById('surprise-continue-label');
    if (kickerEl && cs.kicker) kickerEl.textContent = cs.kicker;
    if (titleEl && cs.santaTitle) titleEl.textContent = cs.santaTitle;
    if (subEl && cs.santaSubtitle) subEl.textContent = cs.santaSubtitle;
    if (hintEl && cs.boxHint) hintEl.textContent = cs.boxHint;
    if (badgeEl && cs.giftBadge) badgeEl.textContent = cs.giftBadge;
    if (gTitleEl && cs.giftTitle) gTitleEl.textContent = cs.giftTitle;
    if (gMsgEl && cs.giftMessage) gMsgEl.textContent = cs.giftMessage;
    if (gNoteEl && cs.giftNote) gNoteEl.textContent = cs.giftNote;
    if (contEl && cs.continueLabel) contEl.textContent = cs.continueLabel;

    const voucherListEl = document.getElementById('gift-voucher-list');
    const voucherConfirmBtn = document.getElementById('gift-voucher-confirm');
    const voucherStatusEl = document.getElementById('gift-voucher-status');
    let pendingVoucher = null;
    let voucherClaimed = false;

    function voucherIconSvg(id) {
      if (id === 'matcha') {
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`;
      }
      if (id === 'movie') {
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9.5h5M17 9.5h5M2 14.5h5M17 14.5h5"/></svg>`;
      }
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
    }

    function applyVoucherLockState(selectedId) {
      if (!voucherListEl) return;
      voucherListEl.querySelectorAll('.gift-voucher-btn').forEach((item) => {
        const isChosen = item.dataset.voucherId === selectedId;
        item.classList.toggle('is-selected', isChosen);
        item.classList.toggle('is-dimmed', voucherClaimed && !isChosen);
        item.disabled = voucherClaimed;
      });
    }

    resetVoucherSelection = () => {
      pendingVoucher = null;
      voucherClaimed = false;
      applyVoucherLockState('');
      if (voucherConfirmBtn) {
        voucherConfirmBtn.hidden = true;
        voucherConfirmBtn.disabled = false;
      }
      if (voucherStatusEl) {
        voucherStatusEl.hidden = true;
        voucherStatusEl.textContent = '';
      }
    };

    if (voucherListEl && Array.isArray(cs.vouchers)) {
      cs.vouchers.forEach((voucher) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gift-voucher-btn';
        btn.dataset.voucherId = voucher.id;
        btn.innerHTML = `
          <span class="gift-voucher-icon" aria-hidden="true">${voucherIconSvg(voucher.id)}</span>
          <span class="gift-voucher-copy">
            <strong>${voucher.title}</strong>
            <small>${voucher.desc}</small>
          </span>
          <span class="gift-voucher-check" aria-hidden="true">✓</span>
        `;
        btn.addEventListener('click', () => {
          if (voucherClaimed) return;
          pendingVoucher = voucher;
          applyVoucherLockState(voucher.id);
          if (voucherConfirmBtn) {
            voucherConfirmBtn.textContent = `Konfirmasi Pilihan: ${voucher.title}`;
            voucherConfirmBtn.hidden = false;
          }
        });
        voucherListEl.appendChild(btn);
      });

      if (voucherConfirmBtn) {
        voucherConfirmBtn.addEventListener('click', async () => {
          if (!pendingVoucher || voucherClaimed) return;
          voucherClaimed = true;
          voucherConfirmBtn.disabled = true;
          voucherConfirmBtn.textContent = 'Mengirim pilihanmu…';
          applyVoucherLockState(pendingVoucher.id);
          playChime('gift');
          await sendFeedbackToTelegram({
            type: 'gift_claim',
            choice: pendingVoucher.title,
            message: pendingVoucher.desc
          });
          voucherConfirmBtn.hidden = true;
          if (voucherStatusEl) {
            voucherStatusEl.textContent = `Voucher "${pendingVoucher.title}" sudah diklaim & diteruskan ke Andrian ✓`;
            voucherStatusEl.hidden = false;
          }
        });
      }
    }
  }

  function spawnSurpriseParticles(count = 26) {
    if (!surpriseParticles || reducedMotion) return;
    surpriseParticles.replaceChildren();
    for (let i = 0; i < count; i += 1) {
      const star = document.createElement('span');
      star.className = 'starfall-burst-particle';
      const startX = 6 + Math.random() * 88;
      const startY = -6 + Math.random() * 24;
      const dx = (Math.random() - 0.5) * 160;
      const dy = (55 + Math.random() * 42) + 'vh';
      const size = 12 + Math.random() * 16;
      const dur = 1100 + Math.random() * 750;
      const delay = i * 35 + Math.random() * 220;
      star.style.setProperty('--sb-x', `${startX.toFixed(1)}%`);
      star.style.setProperty('--sb-y', `${startY.toFixed(1)}%`);
      star.style.setProperty('--sb-dx', `${dx.toFixed(1)}px`);
      star.style.setProperty('--sb-dy', dy);
      star.style.setProperty('--sb-size', `${size.toFixed(1)}px`);
      star.style.setProperty('--sb-dur', `${dur.toFixed(0)}ms`);
      star.style.setProperty('--sb-delay', `${delay.toFixed(0)}ms`);
      star.style.setProperty('--sb-tilt', `${(-dx * 0.14).toFixed(1)}deg`);
      star.style.setProperty('--sb-rot', `${(Math.random() > 0.5 ? 1 : -1) * 190}deg`);
      star.innerHTML = goldenStarSvg();
      surpriseParticles.appendChild(star);
    }
  }

  function openChristmasSurpriseModal(fromFlight = false) {
    if (!surpriseModal) return;
    resetVoucherSelection();
    surpriseFromSantaFlight = fromFlight;
    unboxAnimating = false;
    santaOfferStage.hidden = false;
    santaOfferStage.classList.remove('is-zooming-box');
    giftUnboxStage.hidden = true;
    giftUnboxStage.classList.remove('is-card-visible');
    unbox3dBox.classList.remove('is-untying', 'is-opened');
    unbox3dBox.disabled = false;
    surpriseModal.hidden = false;
    spawnSurpriseParticles(22);
    window.setTimeout(() => {
      if (santaOfferBtn) santaOfferBtn.focus({ preventScroll: true });
    }, 120);
  }

  function closeChristmasSurpriseModal(navigateToGallery = false) {
    if (!surpriseModal) return;
    surpriseModal.hidden = true;
    if (surpriseParticles) surpriseParticles.replaceChildren();
    if (navigateToGallery) {
      goToScene('gallery');
    }
  }

  let boxPullStartY = null;
  let boxOpenedYet = false;

  function moveToGiftBoxStage() {
    if (unboxAnimating) return;
    unboxAnimating = true;
    boxOpenedYet = false;
    santaOfferStage.classList.add('is-zooming-box');

    window.setTimeout(() => {
      santaOfferStage.hidden = true;
      santaOfferStage.classList.remove('is-zooming-box');
      giftUnboxStage.hidden = false;
      unboxAnimating = false;
      if (unbox3dBox) unbox3dBox.focus({ preventScroll: true });
    }, 340);
  }

  function openGiftBox() {
    if (boxOpenedYet || unboxAnimating) return;
    boxOpenedYet = true;
    unboxAnimating = true;
    unbox3dBox.disabled = true;
    unbox3dBox.classList.add('is-untying');
    playChime('sparkle');

    window.setTimeout(() => {
      unbox3dBox.classList.remove('is-untying');
      unbox3dBox.classList.add('is-opened');
      playChime('gift');
      spawnSurpriseParticles(32);

      window.setTimeout(() => {
        giftUnboxStage.classList.add('is-card-visible');
        unboxAnimating = false;
        if (surpriseContinueBtn) surpriseContinueBtn.focus({ preventScroll: true });
      }, 360);
    }, 480);
  }

  if (santaOfferBtn) santaOfferBtn.addEventListener('click', moveToGiftBoxStage);
  if (unbox3dBox) {
    unbox3dBox.addEventListener('pointerdown', (event) => {
      boxPullStartY = event.clientY;
    });
    unbox3dBox.addEventListener('pointerup', (event) => {
      if (boxPullStartY === null) return;
      const deltaY = event.clientY - boxPullStartY;
      boxPullStartY = null;
      if (deltaY < -20) {
        openGiftBox();
      }
    });
    unbox3dBox.addEventListener('pointercancel', () => {
      boxPullStartY = null;
    });
    unbox3dBox.addEventListener('click', openGiftBox);
  }
  if (surpriseCloseBtn) {
    surpriseCloseBtn.addEventListener('click', () => {
      closeChristmasSurpriseModal(surpriseFromSantaFlight);
    });
  }
  if (surpriseContinueBtn) {
    surpriseContinueBtn.addEventListener('click', () => {
      closeChristmasSurpriseModal(true);
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && surpriseModal && !surpriseModal.hidden) {
      closeChristmasSurpriseModal(surpriseFromSantaFlight);
    }
  });

  function updateCountdown() {
    const now = new Date();
    const captionEl = document.getElementById('countdown-caption');
    const valuesEl = document.getElementById('countdown-values');
    const events = Array.isArray(DATA.main.countdownEvents) && DATA.main.countdownEvents.length
      ? DATA.main.countdownEvents
      : [{ month: 12, day: 25, label: DATA.main.countdownLabel, todayLabel: 'Selamat Hari Natal, Jessica!' }];

    const christmasToday = isChristmasDay();
    const todayEvent = christmasToday
      ? events.find((ev) => ev.month === 12 && ev.day === 25) || events[0]
      : events.find((ev) => now.getMonth() + 1 === ev.month && now.getDate() === ev.day);

    if (todayEvent) {
      if (captionEl) captionEl.textContent = todayEvent.todayLabel;
      document.getElementById('cd-days').textContent = '0';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      if (christmasToday && !cakeOpening && cakeHint) {
        cakeHint.textContent = 'Sentuh Santa Claus untuk kejutan spesial 25 Desember';
      }
      return;
    }

    if (valuesEl) valuesEl.hidden = false;

    // Cari event terdekat berikutnya dalam siklus tahunan: Natal -> Tahun Baru -> Ulang Tahun -> Natal
    let nextEvent = null;
    let nextTarget = null;
    for (const ev of events) {
      let candidate = new Date(now.getFullYear(), ev.month - 1, ev.day, 0, 0, 0, 0);
      if (candidate <= now) {
        candidate = new Date(now.getFullYear() + 1, ev.month - 1, ev.day, 0, 0, 0, 0);
      }
      if (!nextTarget || candidate < nextTarget) {
        nextTarget = candidate;
        nextEvent = ev;
      }
    }

    if (captionEl && nextEvent) captionEl.textContent = nextEvent.label;
    let remaining = nextTarget.getTime() - now.getTime();
    const days = Math.floor(remaining / 86400000);
    remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    document.getElementById('cd-days').textContent = String(days);
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function initWebPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (!DATA.api || !DATA.api.vapidPublicKey) return;

    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      const sub = await reg.pushManager.getSubscription();

      const promptEl = document.getElementById('notification-prompt');
      const statusBtn = document.getElementById('notification-status-btn');
      const statusText = document.getElementById('notification-status-text');

      function updateStatus(isSubscribed) {
        if (!statusBtn || !statusText) return;
        if (isSubscribed) {
          statusBtn.classList.add('is-active');
          statusText.textContent = 'Notifikasi cerita baru aktif ✓';
        } else {
          statusBtn.classList.remove('is-active');
          statusText.textContent = 'Notifikasi cerita baru';
        }
      }

      updateStatus(!!sub);

      // Tampilkan toast notifikasi setelah beberapa detik user menjelajahi website
      window.triggerNotificationPrompt = function () {
        const isDismissed = localStorage.getItem('jessica_push_dismissed');
        if (!sub && !isDismissed && promptEl) {
          window.setTimeout(() => {
            promptEl.hidden = false;
          }, 6500);
        }
      };

      const allowBtn = document.getElementById('btn-notification-allow');
      const dismissBtn = document.getElementById('btn-notification-dismiss');

      async function subscribeUser() {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            if (promptEl) promptEl.hidden = true;
            return;
          }

          const newSub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(DATA.api.vapidPublicKey)
          });

          await fetch(`${DATA.api.endpoint}/api/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSub)
          });

          updateStatus(true);
          if (promptEl) promptEl.hidden = true;
        } catch (err) {
          console.warn('Gagal mendaftarkan Web Push:', err);
        }
      }

      if (allowBtn) allowBtn.addEventListener('click', subscribeUser);
      if (statusBtn) {
        statusBtn.addEventListener('click', () => {
          if (!statusBtn.classList.contains('is-active')) {
            subscribeUser();
          }
        });
      }
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          if (promptEl) promptEl.hidden = true;
          localStorage.setItem('jessica_push_dismissed', 'true');
        });
      }
    } catch (e) {
      console.warn('Inisialisasi Service Worker dilewati:', e);
    }
  }

  // ============================================================
  // Fullscreen ASCII Showcase Modal (3D Christmas Tree & Lilies)
  // ============================================================
  const asciiModal = document.getElementById('ascii-showcase-modal');
  const asciiFrame = document.getElementById('ascii-showcase-frame');
  const asciiCloseBtn = document.getElementById('ascii-showcase-close');
  const openAsciiTreeBtn = document.getElementById('open-ascii-tree-btn');
  const openBouquetLetterBtn = document.getElementById('open-bouquet-from-letter');
  const openBouquetGiftBtn = document.getElementById('open-bouquet-from-gift');
  let asciiReturnFocusEl = null;

  function openAsciiShowcase(url, title, triggerEl = null) {
    if (!asciiModal || !asciiFrame) return;
    asciiReturnFocusEl = triggerEl;
    asciiFrame.title = title;
    asciiFrame.src = url;
    asciiModal.hidden = false;
    playChime('sparkle');
    if (asciiCloseBtn) asciiCloseBtn.focus({ preventScroll: true });
  }

  function closeAsciiShowcase() {
    if (!asciiModal || asciiModal.hidden) return;
    asciiModal.hidden = true;
    if (asciiFrame) asciiFrame.src = 'about:blank';
    if (asciiReturnFocusEl) {
      asciiReturnFocusEl.focus({ preventScroll: true });
      asciiReturnFocusEl = null;
    }
  }

  if (openAsciiTreeBtn) {
    openAsciiTreeBtn.addEventListener('click', () => {
      openAsciiShowcase('ascii_christmas_starlight.html', 'Pohon Natal 3D ASCII', openAsciiTreeBtn);
    });
  }
  if (openBouquetLetterBtn) {
    openBouquetLetterBtn.addEventListener('click', () => {
      openAsciiShowcase('index1.html', 'Buket Lily Untuk Jessica', openBouquetLetterBtn);
    });
  }
  if (openBouquetGiftBtn) {
    openBouquetGiftBtn.addEventListener('click', () => {
      openAsciiShowcase('index1.html', 'Buket Lily Spesial', openBouquetGiftBtn);
    });
  }
  if (asciiCloseBtn) {
    asciiCloseBtn.addEventListener('click', closeAsciiShowcase);
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && asciiModal && !asciiModal.hidden) {
      closeAsciiShowcase();
    }
  });

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  renderPin();
  initWebPush();
})();
