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

  function setMusicState(isPlaying) {
    musicButton.classList.toggle('is-playing', isPlaying);
    musicButton.setAttribute('aria-pressed', String(isPlaying));
    musicButton.setAttribute('aria-label', isPlaying ? 'Matikan musik' : 'Putar musik');
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

  function lightCake() {
    if (cakeOpening) return;
    cakeOpening = true;
    cakeGate.classList.add('is-lit');
    cakeGate.setAttribute('aria-pressed', 'true');
    cakeHint.textContent = 'Santa melesat membawa kejutan…';
    if (reducedMotion) {
      window.setTimeout(() => {
        goToScene('gallery');
        cakeGate.classList.remove('is-lit');
        cakeGate.setAttribute('aria-pressed', 'false');
        cakeHint.textContent = 'Sentuh Santa Claus untuk kejutan';
        cakeOpening = false;
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

    function animateSantaFlyAway(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / flightDuration);
      // Smooth continuous acceleration (ease-in-out quad/cubic blend)
      const ease = t < 0.5 ? 1.8 * t * t : 1 - Math.pow(-2 * t + 2, 2.2) / 2;

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
      if (heroSection) heroSection.classList.add('is-zooming-out');
      stage.classList.add('is-flooding');
    }, 1250);

    // Smoothly reveal the Gallery scene and reset Santa's inline styles
    window.setTimeout(() => {
      goToScene('gallery');
      if (heroSection) heroSection.classList.remove('is-zooming-out');
      if (santaWrap) {
        santaWrap.style.transform = '';
        santaWrap.style.opacity = '';
        santaWrap.style.filter = '';
      }
      cakeGate.classList.remove('is-lit');
      cakeGate.setAttribute('aria-pressed', 'false');
      cakeHint.textContent = 'Sentuh Santa Claus untuk kejutan';
      cakeOpening = false;
      stage.classList.add('is-fading');
      window.setTimeout(() => {
        stage.hidden = true;
        stage.classList.remove('is-flooding', 'is-fading');
        stage.replaceChildren();
      }, 850);
    }, 1880);
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
    }, reducedMotion ? 40 : 880);
  }
  lanternPull.addEventListener('pointerdown', (event) => {
    lanternPointerY = event.clientY;
    lanternPull.style.setProperty('--pull-distance', '0px');
    lanternPull.setPointerCapture(event.pointerId);
  });
  lanternPull.addEventListener('pointermove', (event) => {
    if (lanternPointerY === null) return;
    const distance = Math.max(0, Math.min(52, event.clientY - lanternPointerY));
    lanternPull.style.setProperty('--pull-distance', `${distance}px`);
    lanternPull.classList.toggle('is-pulling', distance > 2);
  });
  lanternPull.addEventListener('pointerup', (event) => {
    if (lanternPointerY === null) return;
    const pullDistance = event.clientY - lanternPointerY;
    lanternPointerY = null;
    lanternPull.classList.remove('is-pulling');
    if (pullDistance > 18) {
      lanternPull.classList.add('is-pulled');
      lightLantern();
    } else {
      lanternPull.style.removeProperty('--pull-distance');
    }
  });
  lanternPull.addEventListener('pointercancel', () => {
    lanternPointerY = null;
    lanternPull.classList.remove('is-pulling');
    lanternPull.style.removeProperty('--pull-distance');
  });
  lanternPull.addEventListener('click', lightLantern);

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
  let lastFocusedPhoto = null;
  let currentPhotoIndex = 0;
  let swipeStartX = null;
  let lastSwipeAt = 0;
  const galleryPhotos = DATA.main.gallery.photos;

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    if (lastFocusedPhoto && !lastFocusedPhoto.closest('.gallery-card').hidden) lastFocusedPhoto.focus();
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
      const image = button.querySelector('img');
      const shouldKeepLoaded = distance <= 2 || distance === length - 1;
      if (shouldKeepLoaded) {
        if (!image.hasAttribute('src')) image.src = image.dataset.src;
      } else {
        if (image.hasAttribute('src')) image.removeAttribute('src');
      }
      button.tabIndex = distance === 0 ? 0 : -1;
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
    button.appendChild(image);

    const caption = document.createElement('figcaption');
    caption.textContent = photo.caption;
    caption.hidden = !photo.caption;
    button.addEventListener('click', () => {
      if (Date.now() - lastSwipeAt < 450) return;
      lastFocusedPhoto = button;
      lightboxImage.src = photo.src;
      lightboxImage.alt = photoDescription;
      lightboxCaption.textContent = photo.caption || `Foto kenangan ke-${index + 1}`;
      lightbox.hidden = false;
      document.getElementById('lightbox-close').focus();
    });

    card.append(button, caption);
    galleryGrid.appendChild(card);
  });

  function changePhoto(direction) {
    showPhoto(currentPhotoIndex + direction);
  }

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
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
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

  function updateCountdown() {
    const nextBirthday = new Date(DATA.main.nextBirthday);
    const now = new Date();
    const captionEl = document.getElementById('countdown-caption');

    const isToday = now.getMonth() === nextBirthday.getMonth() && now.getDate() === nextBirthday.getDate();
    if (isToday) {
      if (captionEl) captionEl.textContent = 'Selamat Hari Natal, Jessica!';
      document.getElementById('cd-days').textContent = '0';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      return;
    }

    if (captionEl) captionEl.textContent = DATA.main.countdownLabel;
    let target = new Date(now.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate());
    if (target <= now) {
      target = new Date(now.getFullYear() + 1, nextBirthday.getMonth(), nextBirthday.getDate());
    }

    let remaining = target.getTime() - now.getTime();
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

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  renderPin();
  initWebPush();
})();
