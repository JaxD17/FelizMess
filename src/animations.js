/**
 * =========================================================================
 * MÓDULO DE ANIMACIONES CON GSAP Y CANVAS-CONFETTI
 * Incluye la Apertura Cinemática estilo Cuento de Hadas (Shrek Opening)
 * =========================================================================
 */
import gsap from 'gsap';
import confetti from 'canvas-confetti';

export function animateWelcomeIn() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('.anniversary-label', 
    { opacity: 0, y: -20, letterSpacing: '4px' }, 
    { opacity: 1, y: 0, letterSpacing: '2.5px', duration: 1.1, delay: 0.15 }
  )
  .fromTo('.welcome-names', 
    { opacity: 0, y: 25, scale: 0.95 }, 
    { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power2.out' }, 
    '-=0.7'
  )
  .fromTo('.welcome-lead', 
    { opacity: 0, y: 15 }, 
    { opacity: 1, y: 0, duration: 0.9 }, 
    '-=0.7'
  )
  .fromTo('.btn-primary', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 
    '-=0.5'
  );
}

/**
 * Apertura estilo Shrek:
 * 1. Desvanece la pantalla de inicio.
 * 2. La cámara vuela desde lejos hacia el libro con perspectiva 3D profunda.
 * 3. El libro se acerca al primer plano con presencia imponente.
 * 4. La portada se abre majestuosamente revelando la dedicatoria.
 */
export function animateShrekOpening({ onOpenCover, onComplete } = {}) {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const albumApp = document.getElementById('albumApp');
  const bookElement = document.getElementById('bookElement');
  const topbar = document.querySelector('.app-topbar');
  const bottombar = document.querySelector('.app-bottombar');

  // Destellos mágicos dorados al comenzar el zoom
  confetti({
    particleCount: 35,
    spread: 70,
    origin: { y: 0.5 },
    colors: ['#c99a4c', '#f5ede1', '#721329']
  });

  const masterTL = gsap.timeline();

  // Paso 1: Salida suave de la pantalla de bienvenida
  masterTL.to('.welcome-inner', {
    scale: 0.92,
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in'
  })
  .to('.sea-waves-footer', {
    y: 80,
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in'
  }, '-=0.3')
  .add(() => {
    welcomeScreen.classList.add('fade-out');
    albumApp.classList.remove('hidden');

    // Ocultar controles temporalmente para que solo se vea el libro en la escena
    if (topbar) gsap.set(topbar, { opacity: 0, y: -20 });
    if (bottombar) gsap.set(bottombar, { opacity: 0, y: 20 });

    // Preparar el libro en la distancia (cámara lejana estilo Shrek)
    gsap.set(bookElement, {
      scale: 0.22,
      opacity: 0,
      rotateX: 20,
      rotateY: -12,
      y: 90,
      filter: 'blur(6px)'
    });
  });

  // Paso 2: Zoom cinemático hacia el libro (cámara acercándose a la portada)
  masterTL.to(bookElement, {
    scale: 1,
    opacity: 1,
    rotateX: 0,
    rotateY: 0,
    y: 0,
    filter: 'blur(0px)',
    duration: 1.4,
    ease: 'power3.inOut'
  })
  // Breve pausa dramática contemplando la portada (0.35s)
  .to({}, { duration: 0.35 })
  // Paso 3: Abrir la portada automáticamente
  .add(() => {
    if (typeof onOpenCover === 'function') {
      onOpenCover();
    }
  })
  // Paso 4: Aparecen suavemente los controles de navegación
  .to([topbar, bottombar], {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => {
      if (typeof onComplete === 'function') onComplete();
    }
  }, '+=0.4');
}

export function animateBackToWelcome() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const albumApp = document.getElementById('albumApp');

  if (albumApp) {
    gsap.to(albumApp, {
      opacity: 0,
      scale: 0.98,
      duration: 0.35,
      onComplete: () => {
        albumApp.classList.add('hidden');
        welcomeScreen.classList.remove('fade-out');
        gsap.to('.welcome-inner', { scale: 1, opacity: 1, y: 0, duration: 0.6 });
        gsap.to('.sea-waves-footer', { y: 0, opacity: 1, duration: 0.6 });
      }
    });
  }
}

export function triggerCelebrationConfetti() {
  const count = 90;
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
