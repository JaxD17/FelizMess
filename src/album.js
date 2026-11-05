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
  pagesElements = [];
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
    const rotation = ((index % 5) - 2) * 0.7;

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

    // Estado visual inicial
    pageEl.style.zIndex = totalPagesCount - index;
    if (index === 0) {
      pageEl.style.visibility = 'visible';
      pageEl.style.opacity = '1';
      pageEl.style.pointerEvents = 'auto';
    } else if (index === 1) {
      // La página siguiente se mantiene lista directamente debajo
      pageEl.style.visibility = 'visible';
      pageEl.style.opacity = '1';
      pageEl.style.pointerEvents = 'none';
    } else {
      pageEl.style.visibility = 'hidden';
      pageEl.style.opacity = '0';
      pageEl.style.pointerEvents = 'none';
    }

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
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
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

/**
 * Transición limpia de paso de página 3D:
 * - La página destino ya está visible y descansando debajo (cero parpadeo ni huecos)
 * - La página actual rota elegantemente hacia la izquierda
 */
export function goToPage(targetIndex) {
  if (isAnimating || targetIndex === currentPageIndex || targetIndex < 0 || targetIndex >= totalPagesCount) return;

  isAnimating = true;
  pauseAllVideos();
  playPageFlipSound();

  const isForward = targetIndex > currentPageIndex;
  const currentEl = pagesElements[currentPageIndex];
  const targetEl = pagesElements[targetIndex];

  if (isForward) {
    // Asegurar que la página que se va a revelar esté visible y bien posicionada debajo
    targetEl.style.visibility = 'visible';
    targetEl.style.opacity = '1';
    targetEl.style.zIndex = totalPagesCount - 1;
    gsap.set(targetEl, { rotateY: 0, x: 0, scale: 1 });

    // La página actual tiene la prioridad visual más alta durante el giro
    currentEl.style.zIndex = totalPagesCount;
    currentEl.style.pointerEvents = 'none';

    gsap.to(currentEl, {
      rotateY: -115,
      x: -20,
      opacity: 0,
      duration: 0.72,
      ease: 'power2.inOut',
      onComplete: () => {
        currentEl.classList.add('turned');
        currentEl.style.visibility = 'hidden';
        currentEl.style.pointerEvents = 'none';

        targetEl.style.zIndex = totalPagesCount;
        targetEl.style.pointerEvents = 'auto';

        // Preparar la siguiente página en la cola
        if (targetIndex + 1 < totalPagesCount) {
          const nextNextEl = pagesElements[targetIndex + 1];
          nextNextEl.style.visibility = 'visible';
          nextNextEl.style.opacity = '1';
          nextNextEl.style.zIndex = totalPagesCount - 2;
          gsap.set(nextNextEl, { rotateY: 0, x: 0, scale: 1 });
        }

        isAnimating = false;
        if (targetIndex === totalPagesCount - 1) {
          triggerCelebrationConfetti();
        }
      }
    });
  } else {
    // Retrocediendo
    targetEl.style.visibility = 'visible';
    targetEl.style.opacity = '0';
    targetEl.style.zIndex = totalPagesCount;
    targetEl.classList.remove('turned');

    gsap.fromTo(targetEl, 
      { rotateY: -115, x: -20, opacity: 0 }, 
      { 
        rotateY: 0, 
        x: 0, 
        opacity: 1, 
        duration: 0.72, 
        ease: 'power2.inOut',
        onComplete: () => {
          targetEl.style.pointerEvents = 'auto';
          currentEl.style.pointerEvents = 'none';

          // Actualizar z-indexes
          pagesElements.forEach((el, idx) => {
            if (idx < targetIndex) {
              el.classList.add('turned');
              el.style.visibility = 'hidden';
            } else if (idx === targetIndex) {
              el.style.zIndex = totalPagesCount;
              el.style.visibility = 'visible';
              el.style.opacity = '1';
            } else if (idx === targetIndex + 1) {
              el.style.zIndex = totalPagesCount - 1;
              el.style.visibility = 'visible';
              el.style.opacity = '1';
            } else {
              el.style.visibility = 'hidden';
            }
          });

          isAnimating = false;
        }
      }
    );
  }

  currentPageIndex = targetIndex;
  updatePaginationUI();
}

function setupPageEvents() {
  const bookElement = document.getElementById('bookElement');
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevPage(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextPage(); });

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

      if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) {
          nextPage();
        } else {
          prevPage();
        }
      }
    }, { passive: true });

    // Clic en la página para pasar (solicitud explícita del usuario)
    bookElement.addEventListener('click', (e) => {
      // Ignorar si se pulsa en botones interactivos, video o edición
      if (e.target.closest('.btn-edit-journal') || 
          e.target.closest('video') || 
          e.target.isContentEditable ||
          e.target.closest('.btn-celebrate-love') ||
          e.target.closest('button')) {
        return;
      }

      const rect = bookElement.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // Si hace clic en el margen izquierdo (primer 22%), vuelve atrás
      if (clickX < rect.width * 0.22 && currentPageIndex > 0) {
        prevPage();
      } else {
        // En todo el resto de la página (78%), pasa a la siguiente
        nextPage();
      }
    });
  }
}

export function resetBookToCover() {
  pauseAllVideos();
  pagesElements.forEach((el, index) => {
    el.classList.remove('turned');
    el.style.opacity = index === 0 ? '1' : (index === 1 ? '1' : '0');
    el.style.visibility = (index === 0 || index === 1) ? 'visible' : 'hidden';
    el.style.pointerEvents = index === 0 ? 'auto' : 'none';
    el.style.zIndex = totalPagesCount - index;
    gsap.set(el, { rotateY: 0, x: 0, scale: 1 });
  });
  currentPageIndex = 0;
  updatePaginationUI();
}
