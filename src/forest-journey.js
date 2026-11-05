/**
 * =========================================================================
 * MÓDULO DEL PASEO POR EL BOSQUE ENCANTADO (FOREST JOURNEY)
 * Caminata fluida con un solo tap en pantalla, árboles y enredaderas que se abren,
 * pajaritos volando, sonido ambiental y llegada cinematográfica al atril de piedra.
 * =========================================================================
 */
import gsap from 'gsap';

class ForestJourneyController {
  constructor() {
    this.isWalking = false;
    this.isArrived = false;
    this.audioCtx = null;
  }

  init({ onPedestalReached } = {}) {
    this.onPedestalReached = onPedestalReached;
    this.setupLivingNature();
    this.setupOneTapEvent();
    this.startAmbientBirds();
    this.startAmbientButterflies();
  }

  /**
   * Configuración de Web Audio para pisadas en hojas y brisa
   */
  initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('[Audio] No disponible', e);
    }
  }

  playFootstepSound() {
    if (!this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const bufferSize = ctx.sampleRate * 0.09;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(360 + Math.random() * 100, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {}
  }

  /**
   * Ladrido tierno y juguetón del perrito sintetizado en Web Audio
   */
  playPuppyBark() {
    this.initAudio();
    if (!this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const playYip = (startTime, startFreq, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.65, startTime + dur);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      };

      const now = ctx.currentTime;
      playYip(now, 580, 0.11);
      playYip(now + 0.15, 640, 0.13);
    } catch (e) {}
  }

  /**
   * Pajaritos volando libremente entre el dosel del bosque
   */
  startAmbientBirds() {
    const birdsContainer = document.getElementById('birdsContainer');
    if (!birdsContainer) return;

    const spawnBird = () => {
      if (document.hidden) {
        setTimeout(spawnBird, 3000);
        return;
      }

      const bird = document.createElement('div');
      bird.className = 'magical-forest-bird';
      
      const birdColors = ['#5ca0d3', '#e07a5f', '#f4a261', '#81c784'];
      const chosenColor = birdColors[Math.floor(Math.random() * birdColors.length)];

      bird.innerHTML = `
        <svg viewBox="0 0 48 32" width="34" height="22">
          <path class="bird-wing-left" d="M24,16 Q14,2 4,8 Q14,18 24,18" fill="${chosenColor}" />
          <path class="bird-body" d="M18,16 Q24,12 36,16 Q42,18 46,16 Q38,22 28,21 Z" fill="${chosenColor}" />
          <path class="bird-wing-right" d="M26,16 Q36,2 44,6 Q36,18 26,18" fill="${chosenColor}" opacity="0.85" />
          <circle cx="41" cy="15" r="1.5" fill="#111" />
          <polygon points="46,16 49,17 46,18" fill="#f4a261" />
        </svg>
      `;

      birdsContainer.appendChild(bird);

      const flyFromLeft = Math.random() > 0.5;
      const startX = flyFromLeft ? -80 : window.innerWidth + 80;
      const endX = flyFromLeft ? window.innerWidth + 100 : -100;
      const startY = 60 + Math.random() * (window.innerHeight * 0.4);
      const endY = startY + (Math.random() * 80 - 40);

      gsap.set(bird, {
        x: startX,
        y: startY,
        scaleX: flyFromLeft ? 1 : -1,
        scale: 0.65 + Math.random() * 0.5,
        opacity: 0.95
      });

      const wingL = bird.querySelector('.bird-wing-left');
      const wingR = bird.querySelector('.bird-wing-right');
      gsap.to([wingL, wingR], {
        scaleY: -0.6,
        transformOrigin: 'bottom center',
        duration: 0.12,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      gsap.to(bird, {
        x: endX,
        y: endY,
        duration: 4.5 + Math.random() * 2.5,
        ease: 'power1.inOut',
        onComplete: () => bird.remove()
      });

      setTimeout(spawnBird, 3500 + Math.random() * 4000);
    };

    setTimeout(spawnBird, 800);
    setTimeout(spawnBird, 2800);
  }

  /**
   * Mariposas revoloteando
   */
  startAmbientButterflies() {
    const butterflyContainer = document.getElementById('butterfliesContainer');
    if (!butterflyContainer) return;

    for (let i = 0; i < 3; i++) {
      const bf = document.createElement('div');
      bf.className = 'forest-butterfly';
      bf.innerHTML = `
        <svg viewBox="0 0 32 32" width="20" height="20">
          <ellipse cx="12" cy="12" rx="7" ry="5" fill="#fbc02d" class="bf-wing-l" />
          <ellipse cx="20" cy="12" rx="7" ry="5" fill="#fbc02d" class="bf-wing-r" />
          <line x1="16" y1="8" x2="16" y2="24" stroke="#4e342e" stroke-width="2" stroke-linecap="round" />
        </svg>
      `;
      butterflyContainer.appendChild(bf);

      const wingL = bf.querySelector('.bf-wing-l');
      const wingR = bf.querySelector('.bf-wing-r');

      gsap.to(wingL, { scaleX: 0.15, transformOrigin: 'right center', duration: 0.14, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(wingR, { scaleX: 0.15, transformOrigin: 'left center', duration: 0.14, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      const startX = 40 + Math.random() * (window.innerWidth - 80);
      const startY = window.innerHeight * 0.45 + Math.random() * (window.innerHeight * 0.35);

      gsap.set(bf, { x: startX, y: startY, opacity: 0.85 });

      gsap.to(bf, {
        x: `+=${Math.random() * 120 - 60}`,
        y: `+=${Math.random() * 80 - 40}`,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  setupLivingNature() {
    const vines = document.querySelectorAll('.hanging-vine');
    vines.forEach((vine, i) => {
      gsap.to(vine, {
        rotate: i % 2 === 0 ? 3 : -3,
        transformOrigin: 'top center',
        duration: 3.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  /**
   * Con solo hacer tap/clic en cualquier parte de la pantalla, comienza la caminata
   */
  setupOneTapEvent() {
    const stage = document.getElementById('forestJourneyStage');
    if (!stage) return;

    const handleInitialTap = (e) => {
      if (this.isWalking || this.isArrived) return;
      if (e.target.closest('#fairytalePuppy')) return;
      this.initAudio();
      this.startWalkingToPedestal();
    };

    stage.addEventListener('click', handleInitialTap);
    stage.addEventListener('touchend', (e) => {
      if (!this.isWalking && !this.isArrived) {
        handleInitialTap(e);
      }
    }, { passive: true });
  }

  /**
   * CAMINATA FLUIDA HACIA EL ATRIL DE PIEDRA
   */
  startWalkingToPedestal() {
    this.isWalking = true;

    // 1. Desvanecer suavemente el texto inicial
    gsap.to('#welcomeScreen', {
      opacity: 0,
      scale: 0.95,
      y: -25,
      duration: 0.7,
      ease: 'power2.in',
      onComplete: () => {
        const welcome = document.getElementById('welcomeScreen');
        if (welcome) welcome.style.display = 'none';
      }
    });

    // 2. Iniciar sonidos de pisadas suaves en hojas
    const stepInterval = setInterval(() => {
      if (this.isArrived) {
        clearInterval(stepInterval);
        return;
      }
      this.playFootstepSound();
    }, 400);

    const scenery = document.getElementById('forestWorldScenery');
    const pathImg = document.getElementById('forestPathwayImg');
    const clearingImg = document.getElementById('forestClearingImg');
    const vinesL = document.querySelector('.curtain-vines-left');
    const vinesR = document.querySelector('.curtain-vines-right');

    const walkTL = gsap.timeline({
      onComplete: () => {
        clearInterval(stepInterval);
        this.isWalking = false;
        this.isArrived = true;

        if (typeof this.onPedestalReached === 'function') {
          this.onPedestalReached();
        }
      }
    });

    // 3. La cámara avanza por el sendero: el camino se agranda en perspectiva (dolly forward)
    walkTL.to(pathImg, {
      scale: 1.45,
      y: '-8%',
      duration: 3.2,
      ease: 'power2.inOut'
    }, 0)
    // Las ramas y enredaderas del primer plano se apartan como si camináramos entre ellas
    .to(vinesL, {
      x: -120,
      rotate: -12,
      opacity: 0.2,
      duration: 2.8,
      ease: 'power2.out'
    }, 0)
    .to(vinesR, {
      x: 120,
      rotate: 12,
      opacity: 0.2,
      duration: 2.8,
      ease: 'power2.out'
    }, 0)
    // El balanceo natural de la cámara con cada paso
    .to(scenery, {
      y: '+=6',
      duration: 0.2,
      repeat: 12,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0)
    // 4. A mitad del camino, el claro con el atril de piedra se funde suavemente
    .fromTo(clearingImg, 
      { opacity: 0, scale: 1.15 }, 
      { opacity: 1, scale: 1.0, duration: 1.8, ease: 'power2.out' }, 
      1.4
    );
  }

  reset() {
    this.isWalking = false;
    this.isArrived = false;

    const welcome = document.getElementById('welcomeScreen');
    if (welcome) {
      welcome.style.display = 'flex';
      gsap.to(welcome, { opacity: 1, scale: 1, y: 0, duration: 0.5 });
    }

    const pathImg = document.getElementById('forestPathwayImg');
    const clearingImg = document.getElementById('forestClearingImg');
    const vinesL = document.querySelector('.curtain-vines-left');
    const vinesR = document.querySelector('.curtain-vines-right');

    if (pathImg) gsap.set(pathImg, { scale: 1, y: 0 });
    if (clearingImg) gsap.set(clearingImg, { opacity: 0, scale: 1.15 });
    if (vinesL) gsap.set(vinesL, { x: 0, rotate: 0, opacity: 0.95 });
    if (vinesR) gsap.set(vinesR, { x: 0, rotate: 0, opacity: 0.95 });
  }
}

export const forestJourney = new ForestJourneyController();
