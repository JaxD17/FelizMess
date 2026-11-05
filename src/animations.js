/**
 * =========================================================================
 * MÓDULO DE ANIMACIONES CON GSAP Y CANVAS-CONFETTI
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

export function animateOpenAlbum(onComplete) {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const albumApp = document.getElementById('albumApp');

  const tl = gsap.timeline({
    onComplete: () => {
      welcomeScreen.classList.add('fade-out');
      if (typeof onComplete === 'function') onComplete();
    }
  });

  tl.to('.welcome-inner', {
    scale: 0.96,
    opacity: 0,
    y: -20,
    duration: 0.55,
    ease: 'power2.in'
  })
  .to('.sea-waves-footer', {
    y: 60,
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in'
  }, '-=0.35');

  if (albumApp) {
    albumApp.classList.remove('hidden');
    gsap.fromTo(albumApp, 
      { opacity: 0, scale: 0.98 }, 
      { opacity: 1, scale: 1, duration: 0.75, ease: 'power2.out', delay: 0.25 }
    );
  }
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

  // Confeti refinado con colores oro, borgoña y arena
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
