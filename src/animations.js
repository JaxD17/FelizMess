/**
 * =========================================================================
 * MÓDULO DE ANIMACIONES CON GSAP Y CANVAS-CONFETTI
 * Secuencia Cinemática del Bosque Encantado, Atril de Piedra y Zoom
 * =========================================================================
 */
import gsap from 'gsap';
import confetti from 'canvas-confetti';

export function animateWelcomeIn() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('.anniversary-badge', 
    { opacity: 0, y: -20, letterSpacing: '4px' }, 
    { opacity: 1, y: 0, letterSpacing: '2.5px', duration: 1.1, delay: 0.2 }
  )
  .fromTo('.story-names-title', 
    { opacity: 0, y: 25, scale: 0.95 }, 
    { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power2.out' }, 
    '-=0.7'
  )
  .fromTo('.story-lead-quote', 
    { opacity: 0, y: 15 }, 
    { opacity: 1, y: 0, duration: 0.9 }, 
    '-=0.7'
  )
  .fromTo('.btn-approach-pedestal', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 
    '-=0.5'
  );

  // Animación suave de partículas mágicas en el bosque
  createFloatingForestSpores();
}

/**
 * Secuencia cinemática de acercamiento hacia el atril de piedra y apertura física del libro
 */
export function animateForestToPedestalZoom({ onOpenCover, onComplete } = {}) {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const albumApp = document.getElementById('albumApp');
  const forestBgImg = document.getElementById('forestBgImg');
  const bookStage = document.getElementById('bookStage');
  const topbar = document.querySelector('.app-topbar');
  const bottombar = document.querySelector('.app-bottombar');

  // Destellos suaves de magia en el bosque
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { y: 0.55 },
    colors: ['#f2ba49', '#80cbc4', '#df9e26', '#ffffff']
  });

  const masterTL = gsap.timeline();

  // Paso 1: Salida del texto inicial
  masterTL.to('.welcome-story-card', {
    scale: 0.9,
    opacity: 0,
    y: -25,
    duration: 0.5,
    ease: 'power2.in'
  })
  .to('.forest-hint-tap', {
    opacity: 0,
    duration: 0.3
  }, '-=0.3')
  .add(() => {
    welcomeScreen.classList.add('fade-out');
    albumApp.classList.remove('hidden');

    if (topbar) gsap.set(topbar, { opacity: 0, y: -20 });
    if (bottombar) gsap.set(bottombar, { opacity: 0, y: 20 });

    // El libro y el atril inician en la distancia
    gsap.set(bookStage, {
      scale: 0.35,
      y: 60,
      opacity: 0
    });
  });

  // Paso 2: Zoom de cámara cinematográfico (el fondo del bosque se acerca y gana desenfoque de profundidad)
  masterTL.to(forestBgImg, {
    scale: 1.55,
    y: '-8%',
    filter: 'blur(3px) brightness(0.65)',
    duration: 1.6,
    ease: 'power3.inOut'
  }, 'cameraZoom')
  .to(bookStage, {
    scale: 1,
    y: 0,
    opacity: 1,
    duration: 1.6,
    ease: 'power3.inOut'
  }, 'cameraZoom')
  // Pausa contemplativa frente al atril de piedra con el libro cerrado
  .to({}, { duration: 0.4 })
  // Paso 3: La portada se abre físicamente en 3D
  .add(() => {
    if (typeof onOpenCover === 'function') {
      onOpenCover();
    }
  })
  // Paso 4: Aparecen los controles de navegación
  .to([topbar, bottombar], {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => {
      if (typeof onComplete === 'function') onComplete();
    }
  }, '+=0.6');
}

export function animateBackToForest() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const albumApp = document.getElementById('albumApp');
  const forestBgImg = document.getElementById('forestBgImg');

  if (albumApp) {
    gsap.to(albumApp, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        albumApp.classList.add('hidden');
        welcomeScreen.classList.remove('fade-out');
        gsap.to('.welcome-story-card', { scale: 1, opacity: 1, y: 0, duration: 0.6 });
        gsap.to('.forest-hint-tap', { opacity: 1, duration: 0.6 });
        gsap.to(forestBgImg, { scale: 1, y: 0, filter: 'blur(0px) brightness(1)', duration: 0.8 });
      }
    });
  }
}

export function triggerCelebrationConfetti() {
  const count = 100;
  const defaults = {
    origin: { y: 0.75 },
    zIndex: 999
  };

  function fire(ratio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * ratio)
    });
  }

  fire(0.3, {
    spread: 35,
    startVelocity: 48,
    colors: ['#c99a4c', '#e2be78', '#faf5eb']
  });
  fire(0.25, {
    spread: 65,
    colors: ['#781328', '#941c34', '#c99a4c']
  });
  fire(0.3, {
    spread: 110,
    decay: 0.92,
    colors: ['#52796f', '#84a98c', '#c99a4c']
  });
  fire(0.15, {
    spread: 130,
    startVelocity: 24,
    colors: ['#faf5eb', '#c99a4c']
  });
}

function createFloatingForestSpores() {
  const container = document.getElementById('particlesField');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'forest-spore';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDuration = `${6 + Math.random() * 8}s`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    container.appendChild(p);
  }
}
