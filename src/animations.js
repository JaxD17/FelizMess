/**
 * =========================================================================
 * MÓDULO DE ANIMACIONES CON GSAP Y CANVAS-CONFETTI
 * Secuencia Cinemática del Bosque Encantado, Atril de Piedra y Zoom
 * =========================================================================
 */
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { forestJourney } from './forest-journey.js';

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
  .fromTo('#tapToWalkPrompt', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 
    '-=0.5'
  );

  createFloatingForestSpores();
}

/**
 * Secuencia de llegada al atril de piedra descubierto:
 * La cámara se posiciona frente al atril y EN ESE MOMENTO aparece el libro
 */
export function animatePedestalArrival({ onBookRevealed } = {}) {
  const albumApp = document.getElementById('albumApp');
  const bookStage = document.getElementById('bookStage');
  const bookElement = document.getElementById('bookElement');
  const topbar = document.querySelector('.app-topbar');
  const bottombar = document.querySelector('.app-bottombar');

  // Destellos dorados en el claro del bosque
  confetti({
    particleCount: 35,
    spread: 70,
    origin: { y: 0.5 },
    colors: ['#f2ba49', '#80cbc4', '#df9e26', '#ffffff']
  });

  albumApp.classList.remove('hidden');

  if (topbar) gsap.set(topbar, { opacity: 0, y: -20 });
  if (bottombar) gsap.set(bottombar, { opacity: 0, y: 20 });

  // Desplazamiento cinematográfico de la cámara para posarse frente al atril de lectura
  gsap.to('#forestWorldScenery', {
    scale: 1.25,
    y: '5%',
    duration: 1.4,
    ease: 'power2.out'
  });

  // El libro aparece descansando sobre el atril con un brillo dorado
  gsap.fromTo(bookStage, 
    { scale: 0.85, opacity: 0, y: 35 }, 
    { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
  );

  gsap.to([topbar, bottombar], {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.4,
    onComplete: () => {
      if (typeof onBookRevealed === 'function') onBookRevealed();
    }
  });
}

export function animateBackToForest() {
  const albumApp = document.getElementById('albumApp');

  // Retornar suavemente el zoom del fondo al estado panorámico del sendero
  gsap.to('#forestWorldScenery', {
    scale: 1.0,
    y: 0,
    duration: 0.8,
    ease: 'power2.inOut'
  });

  if (albumApp) {
    gsap.to(albumApp, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        albumApp.classList.add('hidden');
        albumApp.style.opacity = '1';
        forestJourney.reset();
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

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#580c1f', '#c99a4c', '#e6c887']
  });
  fire(0.2, {
    spread: 60,
    colors: ['#df9e26', '#f2ba49', '#ffffff']
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#6b1426', '#c99a4c', '#80cbc4']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#c99a4c', '#df9e26']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#ffffff', '#f2ba49']
  });
}

function createFloatingForestSpores() {
  const field = document.getElementById('particlesField');
  if (!field) return;

  field.innerHTML = '';
  const numSpores = 28;

  for (let i = 0; i < numSpores; i++) {
    const spore = document.createElement('div');
    spore.className = 'forest-spore';

    const size = 3 + Math.random() * 4;
    const left = Math.random() * 100;
    const top = 30 + Math.random() * 65;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 5;

    spore.style.width = `${size}px`;
    spore.style.height = `${size}px`;
    spore.style.left = `${left}%`;
    spore.style.top = `${top}%`;
    spore.style.animationDuration = `${duration}s`;
    spore.style.animationDelay = `${delay}s`;

    field.appendChild(spore);
  }
}
