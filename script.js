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

  const flowerPalette = [
    ['#d96b82', '#f6b8c3'],
    ['#e4a34e', '#f8d58e'],
    ['#e99eae', '#ffdce2'],
    ['#70a887', '#b4d5a7'],
    ['#9371b2', '#cdb4dc'],
    ['#6cacc1', '#b2dfe0'],
    ['#fff7e9', '#fffdf6'],
  ];

  let flowerSvgInstance = 0;
  function flowerSvg(index) {
    const [tone, light] = flowerPalette[index % flowerPalette.length];
    const id = `flower-${index}-${flowerSvgInstance}`;
    flowerSvgInstance += 1;
    // Overlapping, slightly uneven petals and soft shading give the blooms
    // more depth than the previous flat, identical daisy silhouettes.
    const petal = 'M50 57 C44 52 25 38 28 24 C30 14 39 8 46 15 C49 18 50 23 50 29 C51 20 56 12 64 15 C75 20 72 34 66 43 C61 50 55 55 50 57Z';
    const layers = [
      { count: 10, scale: 1, opacity: .82, offset: 0 },
      { count: 8, scale: .77, opacity: .82, offset: 22.5 },
      { count: 6, scale: .53, opacity: .95, offset: 8 },
    ];
    const petals = layers.map(({ count, scale, opacity, offset }) =>
      `<g opacity="${opacity}" transform="translate(50 50) scale(${scale}) translate(-50 -50)">` +
      Array.from({ length: count }, (_, i) => {
        const angle = i * 360 / count + offset + (i % 2 ? 2 : -2);
        return `<path d="${petal}" fill="url(#${id}-petal)" stroke="${light}" stroke-opacity=".34" stroke-width=".8" transform="rotate(${angle} 50 50)"/>`;
      }).join('') + `</g>`
    ).join('');
    const folds = Array.from({ length: 12 }, (_, i) =>
      `<path d="M50 54 Q${44 + (i % 3) * 4} 40 50 22" transform="rotate(${i * 30} 50 50)"/>`
    ).join('');
    const pollen = Array.from({ length: 22 }, (_, i) => {
      const angle = i * 2.399;
      const radius = 2 + (i % 4) * 1.35;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 3 ? 1 : 1.35}"/>`;
    }).join('');
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}-petal" cx="38%" cy="28%" r="78%"><stop stop-color="${light}"/><stop offset=".48" stop-color="${tone}"/><stop offset="1" stop-color="${tone}" stop-opacity=".78"/></radialGradient><radialGradient id="${id}-heart"><stop stop-color="#f9df8b"/><stop offset=".65" stop-color="#d2a75c"/><stop offset="1" stop-color="#81503e"/></radialGradient></defs><g>${petals}</g><g fill="none" stroke="${light}" stroke-opacity=".2" stroke-width=".7">${folds}</g><circle cx="50" cy="50" r="8" fill="url(#${id}-heart)"/><g fill="#fff1bd" opacity=".9">${pollen}</g><circle cx="47" cy="47" r="2" fill="#fff" opacity=".28"/></svg>`;
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
      const size = cellSize * (1.08 + Math.random() * 0.42);
      const middleScale = 1.04 + Math.random() * 0.15;
      const finalScale = 0.75 + Math.random() * 0.34;
      const startRotation = (Math.random() - 0.5) * 90;
      const middleRotation = startRotation + (Math.random() - 0.5) * 250;
      const endRotation = middleRotation + (Math.random() - 0.5) * 80;

      element.className = 'flower-piece';
      element.innerHTML = flowerSvg(index + 2);
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

  function playFlowerTransition(onComplete, originElement = null) {
    if (flowerTransitionRunning) {
      if (onComplete) queuedFlowerTransition = { onComplete, originElement };
      return;
    }
    flowerTransitionRunning = true;
    const overlay = flowerTransition;
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
    const landX = originX ?? width * 0.14;
    const landY = originY ?? height * 0.88;
    const controlX = startX + (landX - startX) * 0.62;
    const controlY = startY + (landY - startY) * 0.16;
    // The opening flower falls into frame; a clicked flower blooms in place.
    const fallDuration = originElement ? 1 : (reducedMotion ? 180 : 1050);

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
                playFlowerTransition(nextTransition.onComplete, nextTransition.originElement);
              } else if (onComplete) {
                onComplete();
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
    }, revealDelay);
  }

  function submitPin() {
    if (enteredPin !== PIN) {
      const keypad = document.getElementById('keypad');
      keypad.classList.remove('is-error');
      void keypad.offsetWidth;
      keypad.classList.add('is-error');
      pinMessage.textContent = 'belum cocok, coba lagi ya';
      enteredPin = '';
      renderPin();
      return;
    }
    unlock();
  }

  function addDigit(digit) {
    if (unlocked || enteredPin.length >= 4) return;
    enteredPin += digit;
    renderPin();
    if (enteredPin.length === 4) window.setTimeout(submitPin, 180);
  }

  document.getElementById('keypad').addEventListener('click', (event) => {
    const button = event.target.closest('[data-digit]');
    if (button) {
      pinMessage.textContent = 'masukkan tanggal untuk melihat kejutanmu';
      addDigit(button.dataset.digit);
    }
  });

  document.getElementById('pin-delete').addEventListener('click', () => {
    if (unlocked) return;
    enteredPin = enteredPin.slice(0, -1);
    pinMessage.textContent = 'masukkan tanggal untuk melihat kejutanmu';
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
    const cakeGate = document.getElementById('cake-gate');
    if (name === 'gallery' && !cakeGate.classList.contains('is-lit')) {
      if (activeScene !== 'hero') goToScene('hero');
      setNavOpen(false);
      document.getElementById('cake-hint').textContent = 'Goreskan dari permukaan kue sampai ke api lilin dulu';
      cakeGate.focus({ preventScroll: true });
      return;
    }
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
    window.setInterval(() => {
      if (activeScene !== 'hero' || petalRain.childElementCount >= 8 || Math.random() > 0.72) return;
      const petal = document.createElement('span');
      const duration = 6200 + Math.random() * 4200;
      petal.className = 'warm-petal';
      petal.style.left = `${4 + Math.random() * 92}%`;
      petal.style.setProperty('--petal-drift', `${(Math.random() - 0.5) * 150}px`);
      petal.style.setProperty('--petal-rotation', `${Math.random() * 360}deg`);
      petal.style.setProperty('--petal-duration', `${duration}ms`);
      petalRain.appendChild(petal);
      window.setTimeout(() => petal.remove(), duration + 100);
    }, 900);
  }

  document.querySelectorAll('[data-next-scene]').forEach((button) => {
    button.addEventListener('click', () => goToScene(button.dataset.nextScene));
  });
  document.querySelectorAll('[data-previous-scene]').forEach((button) => {
    button.addEventListener('click', () => goToScene(button.dataset.previousScene));
  });

  const cakeGate = document.getElementById('cake-gate');
  const cakeArt = document.getElementById('cake-art');
  const cakeTrail = document.getElementById('cake-scratch-trail');
  const cakeHint = document.getElementById('cake-hint');
  const candleTargets = [{ x: 122, y: 42 }, { x: 180, y: 32 }, { x: 238, y: 42 }];
  let scratchStart = null;
  let scratchPoints = [];
  let cakeOpening = false;

  function cakePoint(event) {
    const bounds = cakeArt.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 360,
      y: ((event.clientY - bounds.top) / bounds.height) * 220
    };
  }

  function setScratchPath() {
    if (!scratchPoints.length) {
      cakeTrail.setAttribute('d', '');
      return;
    }

    const number = (value) => value.toFixed(1);
    let path = `M ${number(scratchPoints[0].x)} ${number(scratchPoints[0].y)}`;
    if (scratchPoints.length === 2) {
      path += ` Q ${number(scratchPoints[0].x)} ${number(scratchPoints[0].y)} ${number(scratchPoints[1].x)} ${number(scratchPoints[1].y)}`;
    } else {
      for (let index = 0; index < scratchPoints.length - 1; index += 1) {
        const previous = scratchPoints[Math.max(0, index - 1)];
        const start = scratchPoints[index];
        const end = scratchPoints[index + 1];
        const next = scratchPoints[Math.min(scratchPoints.length - 1, index + 2)];
        const control1 = { x: start.x + (end.x - previous.x) / 6, y: start.y + (end.y - previous.y) / 6 };
        const control2 = { x: end.x - (next.x - start.x) / 6, y: end.y - (next.y - start.y) / 6 };
        path += ` C ${number(control1.x)} ${number(control1.y)} ${number(control2.x)} ${number(control2.y)} ${number(end.x)} ${number(end.y)}`;
      }
    }
    cakeTrail.setAttribute('d', path);
  }

  function lightCake() {
    if (cakeOpening) return;
    cakeOpening = true;
    cakeGate.classList.add('is-lit');
    cakeGate.setAttribute('aria-pressed', 'true');
    cakeHint.textContent = 'Lilin sudah menyala! Membuka galeri…';
    window.setTimeout(() => goToScene('gallery'), reducedMotion ? 50 : 900);
  }

  cakeGate.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const point = cakePoint(event);
    scratchStart = point.x >= 58 && point.x <= 302 && point.y >= 116 && point.y <= 205 ? point : null;
    scratchPoints = scratchStart ? [scratchStart] : [];
    cakeTrail.setAttribute('d', '');
    if (scratchStart) {
      try { cakeGate.setPointerCapture(event.pointerId); } catch { /* synthetic and older pointer events cannot be captured */ }
    }
  });
  cakeGate.addEventListener('pointermove', (event) => {
    if (!scratchStart) return;
    scratchPoints.push(cakePoint(event));
    setScratchPath();
  });
  cakeGate.addEventListener('pointerup', (event) => {
    if (!scratchStart) return;
    const end = cakePoint(event);
    const traveled = scratchPoints.reduce((distance, point, index) => index === 0 ? distance : distance + Math.hypot(point.x - scratchPoints[index - 1].x, point.y - scratchPoints[index - 1].y), 0);
    const reachedCandle = candleTargets.some((target) => Math.hypot(end.x - target.x, end.y - target.y) <= 42);
    scratchStart = null;
    if (traveled >= 60 && reachedCandle) {
      scratchPoints.push(end);
      setScratchPath();
      lightCake();
      return;
    }
    cakeHint.textContent = 'Mulai dari permukaan kue, lalu gores sampai ke api lilin';
    window.setTimeout(() => cakeTrail.setAttribute('d', ''), 700);
  });
  cakeGate.addEventListener('pointercancel', () => {
    scratchStart = null;
    scratchPoints = [];
    cakeTrail.setAttribute('d', '');
  });
  cakeGate.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    lightCake();
  });

  const galleryFlowerNext = document.getElementById('gallery-flower-next');
  const galleryFlowerIcon = galleryFlowerNext.querySelector('.flower-next-icon');
  galleryFlowerIcon.outerHTML = flowerSvg(2).replace('<svg ', '<svg class="flower-next-icon" ');
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
      goToScene(target.dataset.scene);
    }
  });
  document.querySelector('.site-mark').addEventListener('click', (event) => {
    event.preventDefault();
    goToScene('hero');
  });

  const lanternPull = document.getElementById('lantern-pull');
  let lanternPointerY = null;
  let lanternOpening = false;
  function lightLantern() {
    if (lanternOpening) return;
    lanternOpening = true;
    lanternPull.classList.add('is-lit', 'is-pulled');
    window.setTimeout(() => {
      goToScene('letter');
      lanternOpening = false;
      lanternPull.classList.remove('is-lit', 'is-pulled');
      lanternPull.style.removeProperty('--pull-distance');
    }, reducedMotion ? 40 : 700);
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
      if (shouldKeepLoaded && !image.hasAttribute('src')) image.src = image.dataset.src;
      else if (!shouldKeepLoaded && image.hasAttribute('src')) image.removeAttribute('src');
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
    image.loading = 'lazy';
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
      image.className = 'journey-photo';
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
  const letterToggle = document.getElementById('letter-toggle');
  const letterPaper = document.getElementById('letter-paper');
  const letterToggleLabel = document.getElementById('letter-toggle-label');
  letterToggle.addEventListener('click', () => {
    const isOpen = letterToggle.getAttribute('aria-expanded') !== 'true';
    letterToggle.setAttribute('aria-expanded', String(isOpen));
    letterToggle.setAttribute('aria-label', isOpen ? 'Tutup surat' : 'Buka surat');
    letterPaper.setAttribute('aria-hidden', String(!isOpen));
    letterPaper.inert = !isOpen;
    letterCard.classList.toggle('is-open', isOpen);
    letterToggleLabel.textContent = isOpen ? 'sentuh amplop untuk menutup' : 'sentuh amplop untuk membuka';
  });

  function updateCountdown() {
    const nextBirthday = new Date(DATA.main.nextBirthday);
    const now = new Date();
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

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  renderPin();
})();
