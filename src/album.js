/**
 * =========================================================================
 * MÓDULO DEL ÁLBUM: RENDERIZADO EDITORIAL, NAVEGACIÓN 3D, AUDIO Y GESTOS
 * =========================================================================
 */
import gsap from 'gsap';
import { ALBUM_CONFIG, albumPages } from './data.js';
import { getActiveCaption } from './editor.js';
import { triggerCelebrationConfetti } from './animations.js';

let currentPageIndex = 0;
let totalPagesCount = 0;
let isAnimating = false;
let pagesElements = [];

// =========================================================================
// SISTEMA DE AUDIO NATIVO (WEB AUDIO API)
// =========================================================================
let audioCtx = null;
let oceanGainNode = null;
let isOceanPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Sonido sintetizado de pasar página (crujido suave de papel de archivo)
 */
export function playPageFlipSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {
    // Silencioso en navegadores restringidos
  }
}

/**
 * Generador ambiental de oleaje marino (marea crepuscular)
 */
export function toggleOceanSound(forceState) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const targetState = forceState !== undefined ? forceState : !isOceanPlaying;

    if (targetState) {
      if (isOceanPlaying) return true;

      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(220, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      oceanGainNode = ctx.createGain();
      oceanGainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      oceanGainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.8);

      noise.connect(filter);
      filter.connect(oceanGainNode);
      oceanGainNode.connect(ctx.destination);

      noise.start();
      lfo.start();
      isOceanPlaying = true;
      return true;
    } else {
      if (oceanGainNode) {
        oceanGainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        setTimeout(() => {
          oceanGainNode = null;
          isOceanPlaying = false;
        }, 800);
      }
      isOceanPlaying = false;
      return false;
    }
  } catch (e) {
    return false;
  }
}

// =========================================================================
// RENDERIZADO EDITORIAL DE LAS PÁGINAS
// =========================================================================

export function buildBookPages() {
  const bookElement = document.getElementById('bookElement');
  if (!bookElement) return;

  bookElement.innerHTML = '';
  const pagesData = [];

  // 1. Portada del Libro (Piel Guinda + Grabado Oro)
  pagesData.push({
    type: 'cover',
    id: 'cover',
    html: `
      <div class="page-surface cover-surface">
        <div class="cover-frame-border"></div>
        <div class="cover-crest">
          <svg class="crest-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
          </svg>
        </div>
        <div class="cover-eyebrow-text">${ALBUM_CONFIG.anniversaryText}</div>
        <h2 class="cover-main-title">${ALBUM_CONFIG.coupleNames}</h2>
        <div class="cover-divider-line"></div>
        <p class="cover-subtitle-text">Memorias a la orilla del mar</p>
        <div class="cover-tap-prompt">
          <span>Toca para abrir</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    `
  });

  // 2. Dedicatoria
  pagesData.push({
    type: 'dedication',
    id: 'dedication',
    html: `
      <div class="page-surface dedication-surface">
        <div class="dedication-wrapper">
          <div class="dedication-seal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <h3 class="dedication-heading">${ALBUM_CONFIG.dedicationTitle}</h3>
          <div class="dedication-divider"></div>
          <p class="dedication-body" data-page-id="dedication">${getActiveCaption('dedication', ALBUM_CONFIG.dedicationBody)}</p>
        </div>
      </div>
    `
  });

  // 3. Páginas de fotos y videos
  albumPages.forEach((item, index) => {
    const activeText = getActiveCaption(item.id, item.defaultCaption);
    const rotation = ((index % 5) - 2) * 0.8; // Rotación sutil y natural

    let mediaHtml = '';
    if (item.type === 'video') {
      mediaHtml = `
        <div class="archival-media-box">
          <video 
            src="./${item.src}" 
            controls 
            playsinline 
            preload="metadata"
            title="${item.title}"
          ></video>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="archival-media-box">
          <img src="./${item.src}" alt="${item.title}" loading="lazy">
        </div>
      `;
    }

    pagesData.push({
      type: 'memory',
      id: item.id,
      html: `
        <div class="page-surface memory-surface">
          <div class="memory-layout">
            <div class="archival-photo-card" style="--rot: ${rotation}deg;">
              <div class="photo-corner-mount top-left"></div>
              <div class="photo-corner-mount top-right"></div>
              ${mediaHtml}
              <div class="photo-metadata-row">
                <span class="photo-title">${item.title}</span>
                <span class="photo-date">${item.date}</span>
              </div>
            </div>

            <div class="journal-entry-box">
              <button class="btn-edit-journal" title="Editar descripción" aria-label="Editar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  <path d="m15 5 4 4"></path>
                </svg>
              </button>
              <p class="journal-handwritten-text" data-page-id="${item.id}">${activeText}</p>
            </div>
          </div>
        </div>
      `
    });
  });

  // 4. Página Final de Celebración y Amor
  pagesData.push({
    type: 'final',
    id: 'final',
    html: `
      <div class="page-surface final-surface">
        <div class="final-emblem-heart">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h2 class="final-heading">${ALBUM_CONFIG.finalTitle}</h2>
        <div class="final-divider"></div>
        <p class="final-message-text">${ALBUM_CONFIG.finalMessage}</p>
        <div class="final-author-signature">${ALBUM_CONFIG.finalSignature}</div>
        <button class="btn-celebrate-love" id="btnCelebratePage">
          <span>Celebrar nuestro amor</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
    `
  });

  totalPagesCount = pagesData.length;

  pagesData.forEach((page, index) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'book-sheet';
    pageEl.dataset.pageIndex = index;
    pageEl.innerHTML = page.html;
    pageEl.style.zIndex = totalPagesCount - index;

    bookElement.appendChild(pageEl);
    pagesElements.push(pageEl);
  });

  updatePaginationUI();
  setupPaginationDots();
  setupPageEvents();
}

function setupPaginationDots() {
  const dotsContainer = document.getElementById('dotsPagination');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = '';
  const maxDots = Math.min(totalPagesCount, 10);
  for (let i = 0; i < maxDots; i++) {
    const dot = document.createElement('div');
    dot.className = `track-dot ${i === 0 ? 'active' : ''}`;
    dot.dataset.targetIndex = Math.round((i / (maxDots - 1)) * (totalPagesCount - 1));
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.targetIndex, 10);
      goToPage(target);
    });
    dotsContainer.appendChild(dot);
  }
}

function updatePaginationUI() {
  const currentNumEl = document.getElementById('currentPageNum');
  const totalNumEl = document.getElementById('totalPagesNum');
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');

  const formattedCurrent = String(currentPageIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalPagesCount).padStart(2, '0');

  if (currentNumEl) currentNumEl.textContent = formattedCurrent;
  if (totalNumEl) totalNumEl.textContent = formattedTotal;

  if (prevBtn) prevBtn.disabled = (currentPageIndex === 0);
  if (nextBtn) nextBtn.disabled = (currentPageIndex === totalPagesCount - 1);

  const dots = document.querySelectorAll('.track-dot');
  if (dots.length > 0) {
    const activeDotIndex = Math.round((currentPageIndex / (totalPagesCount - 1)) * (dots.length - 1));
    dots.forEach((d, i) => d.classList.toggle('active', i === activeDotIndex));
  }
}

function pauseAllVideos() {
  document.querySelectorAll('video').forEach(vid => {
    try {
      vid.pause();
    } catch (e) {}
  });
}

export function nextPage() {
  if (isAnimating || currentPageIndex >= totalPagesCount - 1) return;
  goToPage(currentPageIndex + 1);
}

export function prevPage() {
  if (isAnimating || currentPageIndex <= 0) return;
  goToPage(currentPageIndex - 1);
}

export function goToPage(targetIndex) {
  if (isAnimating || targetIndex === currentPageIndex || targetIndex < 0 || targetIndex >= totalPagesCount) return;

  isAnimating = true;
  pauseAllVideos();
  playPageFlipSound();

  const isForward = targetIndex > currentPageIndex;
  const currentEl = pagesElements[currentPageIndex];
  const targetEl = pagesElements[targetIndex];

  if (isForward) {
    for (let i = currentPageIndex; i < targetIndex; i++) {
      pagesElements[i].classList.add('turned');
      pagesElements[i].style.zIndex = i + 1;
    }

    gsap.to(currentEl, {
      rotateY: -105,
      scale: 0.96,
      opacity: 0,
      duration: 0.65,
      ease: 'power2.inOut',
      onComplete: () => {
        currentEl.style.opacity = 0;
        currentEl.style.pointerEvents = 'none';
      }
    });

    targetEl.style.opacity = 0;
    targetEl.style.zIndex = totalPagesCount;
    gsap.fromTo(targetEl, 
      { rotateY: 35, scale: 0.97, opacity: 0 }, 
      { 
        rotateY: 0, 
        scale: 1, 
        opacity: 1, 
        duration: 0.7, 
        ease: 'power2.out',
        onComplete: () => {
          isAnimating = false;
          if (targetIndex === totalPagesCount - 1) {
            triggerCelebrationConfetti();
          }
        }
      }
    );
  } else {
    for (let i = targetIndex + 1; i <= currentPageIndex; i++) {
      pagesElements[i].classList.remove('turned');
      pagesElements[i].style.zIndex = totalPagesCount - i;
    }

    targetEl.style.opacity = 0;
    targetEl.style.zIndex = totalPagesCount;
    gsap.fromTo(targetEl, 
      { rotateY: -60, scale: 0.96, opacity: 0 }, 
      { 
        rotateY: 0, 
        scale: 1, 
        opacity: 1, 
        duration: 0.7, 
        ease: 'power2.out',
        onComplete: () => {
          isAnimating = false;
        }
      }
    );

    gsap.to(currentEl, {
      rotateY: 35,
      scale: 0.97,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        currentEl.style.opacity = 0;
        currentEl.style.pointerEvents = 'none';
      }
    });
  }

  currentPageIndex = targetIndex;
  updatePaginationUI();
}

function setupPageEvents() {
  const bookElement = document.getElementById('bookElement');
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');

  if (prevBtn) prevBtn.addEventListener('click', prevPage);
  if (nextBtn) nextBtn.addEventListener('click', nextPage);

  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest('#btnCelebratePage')) {
      triggerCelebrationConfetti();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.isContentEditable) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevPage();
    }
  });

  if (bookElement) {
    let startX = 0;
    let startY = 0;
    let isTouching = false;

    bookElement.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      if (e.target.closest('video') || e.target.isContentEditable) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isTouching = true;
    }, { passive: true });

    bookElement.addEventListener('touchend', (e) => {
      if (!isTouching || e.changedTouches.length !== 1) return;
      isTouching = false;

      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;

      if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0) {
          nextPage();
        } else {
          prevPage();
        }
      }
    }, { passive: true });

    bookElement.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit-journal') || 
          e.target.closest('video') || 
          e.target.isContentEditable ||
          e.target.closest('.btn-celebrate-love')) {
        return;
      }

      if (currentPageIndex === 0) {
        nextPage();
        return;
      }

      const rect = bookElement.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width * 0.65) {
        nextPage();
      } else if (clickX < rect.width * 0.35) {
        prevPage();
      }
    });
  }
}

export function resetBookToCover() {
  pauseAllVideos();
  pagesElements.forEach((el, index) => {
    el.classList.remove('turned');
    el.style.opacity = index === 0 ? 1 : 0;
    el.style.pointerEvents = index === 0 ? 'auto' : 'none';
    el.style.zIndex = totalPagesCount - index;
    gsap.set(el, { rotateY: 0, scale: 1 });
  });
  currentPageIndex = 0;
  updatePaginationUI();
}
