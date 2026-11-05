/**
 * =========================================================================
 * MÓDULO DEL ÁLBUM: LIBRO ABIERTO DE DOS PÁGINAS (SPREADS)
 * Con apertura física de portada, mano animada y audio de bosque/mar
 * =========================================================================
 */
import gsap from 'gsap';
import { ALBUM_CONFIG, albumPages } from './data.js';
import { getActiveField, flushActiveEditing } from './editor.js';
import { triggerCelebrationConfetti } from './animations.js';

let currentSpreadIndex = 0;
let totalSpreadsCount = 0;
let isAnimating = false;
let isCoverOpen = false;

// =========================================================================
// SISTEMA DE AUDIO NATIVO (WEB AUDIO API): PÁJAROS, BOSQUE Y PÁGINA
// =========================================================================
let audioCtx = null;
let natureGainNode = null;
let isNaturePlaying = false;
let birdIntervalId = null;

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
 * Crujido suave y realista de pasar página de libro antiguo
 */
export function playPageFlipSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.16;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.16);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {}
}

/**
 * Trino delicado de pajarito en el bosque
 */
function playBirdChirp() {
  try {
    const ctx = getAudioContext();
    if (!ctx || !isNaturePlaying) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startTime = ctx.currentTime;
    const baseFreq = 2600 + Math.random() * 800;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, startTime + 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, startTime + 0.14);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.035, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.16);
  } catch (e) {}
}

/**
 * Sonido ambiental del bosque (viento entre los árboles + oleaje suave + pájaros)
 */
export function toggleNatureSound(forceState) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const targetState = forceState !== undefined ? forceState : !isNaturePlaying;

    if (targetState) {
      if (isNaturePlaying) return true;

      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.08;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      natureGainNode = ctx.createGain();
      natureGainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      natureGainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);

      noise.connect(filter);
      filter.connect(natureGainNode);
      natureGainNode.connect(ctx.destination);

      noise.start();
      isNaturePlaying = true;

      // Cantos de pájaros aleatorios cada 4-8 segundos
      birdIntervalId = setInterval(() => {
        if (Math.random() > 0.3) {
          playBirdChirp();
          setTimeout(playBirdChirp, 160);
        }
      }, 4500);

      return true;
    } else {
      if (natureGainNode) {
        natureGainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        setTimeout(() => {
          natureGainNode = null;
          isNaturePlaying = false;
        }, 800);
      }
      if (birdIntervalId) {
        clearInterval(birdIntervalId);
        birdIntervalId = null;
      }
      isNaturePlaying = false;
      return false;
    }
  } catch (e) {
    return false;
  }
}

// =========================================================================
// =========================================================================
// GENERACIÓN DINÁMICA DE PÁGINAS (SPREADS) CON VALORES EN TIEMPO REAL
// =========================================================================

export function getSpreadLeftHtml(index) {
  if (index === 0) {
    const title = getActiveField('dedication__title', ALBUM_CONFIG.dedicationTitle || 'Para mi persona favorita');
    const sub = getActiveField('dedication__sub', '1 Año y 7 Meses juntos a la orilla del mar');
    return `
      <div class="page-half-content dedication-left-pane">
        <div class="flourish-crest">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
          </svg>
        </div>
        <h2 class="book-intro-title editable-entry" data-field-key="dedication__title">${title}</h2>
        <div class="ornamental-line"></div>
        <p class="book-intro-sub editable-entry" data-field-key="dedication__sub">${sub}</p>
        <div class="wax-seal-symbol">💌</div>
      </div>
    `;
  }

  if (index >= 1 && index <= albumPages.length) {
    const item = albumPages[index - 1];
    const pageNum = index * 2;
    const photoTitle = getActiveField(`${item.id}__photoTitle`, item.title);
    const photoDate = getActiveField(`${item.id}__photoDate`, item.date);

    let mediaHtml = '';
    if (item.type === 'video') {
      mediaHtml = `
        <div class="spread-media-frame">
          <video 
            src="./${item.src}" 
            controls 
            playsinline 
            preload="metadata"
            title="${photoTitle}"
          ></video>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="spread-media-frame">
          <img src="./${item.src}" alt="${photoTitle}" loading="lazy" class="zoomable-photo" data-full="./${item.src}">
          <button class="btn-zoom-photo" title="Ver foto en grande" aria-label="Ampliar">🔍</button>
        </div>
      `;
    }

    return `
      <div class="page-half-content photo-left-pane">
        <div class="archival-photo-mount">
          <div class="washi-tape-strip"></div>
          <div class="corner-gold top-left"></div>
          <div class="corner-gold top-right"></div>
          ${mediaHtml}
          <div class="photo-info-bar">
            <span class="photo-caption-title editable-entry" data-field-key="${item.id}__photoTitle">${photoTitle}</span>
            <span class="photo-caption-date stamp-style ${(!photoDate || !photoDate.trim()) ? 'empty-date' : ''}"><span class="stamp-icon">📅</span> <span class="editable-entry" data-field-key="${item.id}__photoDate">${photoDate}</span></span>
          </div>
        </div>
        <div class="page-number-footer left-footer">pág. ${String(pageNum).padStart(2, '0')}</div>
      </div>
    `;
  }

  // Spread final
  const finalTitle = getActiveField('final__title', ALBUM_CONFIG.finalTitle || '¡Feliz 1 Año y 7 Meses, Mi Amor!');
  const finalSub = getActiveField('final__sub', 'Para siempre, en cada latido');
  return `
    <div class="page-half-content final-left-pane">
      <div class="beating-heart-emblem">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <h2 class="final-book-title editable-entry" data-field-key="final__title">${finalTitle}</h2>
      <div class="ornamental-line"></div>
      <p class="final-book-sub editable-entry" data-field-key="final__sub">${finalSub}</p>
    </div>
  `;
}

export function getSpreadRightHtml(index) {
  if (index === 0) {
    const text = getActiveField('dedication', ALBUM_CONFIG.dedicationBody);
    return `
      <div class="page-half-content dedication-right-pane">
        <div class="parchment-letter-box">
          <button class="btn-edit-journal" title="Editar dedicatoria" aria-label="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </button>
          <div class="handwriting-ruled-area">
            <p class="journal-handwritten-text dedication-body editable-entry" data-field-key="dedication">${text}</p>
          </div>
        </div>
        <div class="page-number-footer right-footer">pág. 01</div>
      </div>
    `;
  }

  if (index >= 1 && index <= albumPages.length) {
    const item = albumPages[index - 1];
    const pageNum = index * 2 + 1;
    const title = getActiveField(`${item.id}__title`, item.title);
    const caption = getActiveField(item.id, item.defaultCaption);

    return `
      <div class="page-half-content story-right-pane">
        <div class="story-letter-box">
          <div class="journal-entry-box">
            <button class="btn-edit-journal" title="Editar descripción" aria-label="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                <path d="m15 5 4 4"></path>
              </svg>
            </button>
            <h3 class="entry-subheading">
              <span class="editable-entry" data-field-key="${item.id}__title">${title}</span>
              <span class="subheading-heart">♡</span>
            </h3>
            <div class="handwriting-ruled-area">
              <p class="journal-handwritten-text editable-entry" data-field-key="${item.id}">${caption}</p>
            </div>
          </div>
        </div>
        <div class="page-number-footer right-footer">pág. ${String(pageNum).padStart(2, '0')}</div>
      </div>
    `;
  }

  // Spread final
  const finalMessage = getActiveField('final__message', ALBUM_CONFIG.finalMessage);
  const finalSign = getActiveField('final__sign', ALBUM_CONFIG.finalSignature);

  return `
    <div class="page-half-content final-right-pane">
      <div class="final-love-letter">
        <p class="final-letter-text editable-entry" data-field-key="final__message">${finalMessage}</p>
        <div class="final-letter-sign editable-entry" data-field-key="final__sign">${finalSign}</div>
      </div>
      <button class="btn-celebrate-love" id="btnCelebratePage">
        <span>Celebrar nuestro amor</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>
      <div class="page-number-footer right-footer">Fin ❤️</div>
    </div>
  `;
}

export function buildTwoPageBook() {
  const spreadContainer = document.getElementById('spreadContainer');
  if (!spreadContainer) return;

  totalSpreadsCount = albumPages.length + 2;

  // Renderizar el spread actual en el contenedor del libro
  renderCurrentSpread();
  updatePaginationUI();
  setupPaginationDots();
  setupBookEvents();
}

/**
 * Renderiza el par de páginas izquierda y derecha con datos frescos de localStorage
 */
export function renderCurrentSpread() {
  const spreadContainer = document.getElementById('spreadContainer');
  if (!spreadContainer) return;

  const leftHtml = getSpreadLeftHtml(currentSpreadIndex);
  const rightHtml = getSpreadRightHtml(currentSpreadIndex);

  spreadContainer.innerHTML = `
    <div class="open-spread-leaf left-leaf" id="leftLeaf">
      <div class="leaf-paper-surface">
        ${leftHtml}
      </div>
    </div>
    <div class="open-spread-leaf right-leaf" id="rightLeaf">
      <div class="leaf-paper-surface">
        ${rightHtml}
      </div>
    </div>
  `;

  // Sincronizar estado contentEditable según si el modo edición está activo
  const isEditActive = document.body.classList.contains('edit-mode-active');
  spreadContainer.querySelectorAll('[data-field-key]').forEach(el => {
    el.contentEditable = isEditActive ? 'true' : 'false';
  });

  const celebrateBtn = spreadContainer.querySelector('#btnCelebratePage');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCelebrationConfetti();
    });
  }
}

function updatePaginationUI() {
  const currentNumEl = document.getElementById('currentPageNum');
  const totalNumEl = document.getElementById('totalPagesNum');
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');

  const formattedCurrent = String(currentSpreadIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalSpreadsCount).padStart(2, '0');

  if (currentNumEl) currentNumEl.textContent = formattedCurrent;
  if (totalNumEl) totalNumEl.textContent = formattedTotal;

  if (prevBtn) prevBtn.disabled = (!isCoverOpen || currentSpreadIndex === 0);
  if (nextBtn) nextBtn.disabled = (!isCoverOpen || currentSpreadIndex === totalSpreadsCount - 1);

  const dots = document.querySelectorAll('.track-dot');
  if (dots.length > 0) {
    const activeDotIndex = Math.round((currentSpreadIndex / (totalSpreadsCount - 1)) * (dots.length - 1));
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

/**
 * Apertura física de la portada 3D hacia la izquierda (sin desaparecer)
 */
export function openBookCoverPhysical(onComplete) {
  const coverLeaf = document.getElementById('bookCoverLeaf');
  const bookElement = document.getElementById('bookElement');
  if (!coverLeaf || isCoverOpen) return;

  isAnimating = true;
  playPageFlipSound();

  // El libro se expande a dos páginas al abrirse
  if (bookElement) {
    bookElement.classList.remove('book-is-closed');
    bookElement.classList.add('book-is-opening');
  }

  // La portada inicia en zIndex 40 sobre las páginas cerradas
  gsap.set(coverLeaf, { zIndex: 40 });

  // La portada gira 180 grados hacia la izquierda como una tapa de libro real
  gsap.to(coverLeaf, {
    rotateY: -180,
    duration: 1.25,
    ease: 'power2.inOut',
    onUpdate: function() {
      const rot = gsap.getProperty(coverLeaf, 'rotateY');
      // Al superar los -90 grados, baja su zIndex a 2 para posarse como la tapa dura inferior izquierda
      if (rot <= -90) {
        coverLeaf.style.zIndex = '2';
      } else {
        coverLeaf.style.zIndex = '40';
      }
    },
    onComplete: () => {
      isCoverOpen = true;
      coverLeaf.style.zIndex = '2';
      if (bookElement) {
        bookElement.classList.remove('book-is-opening');
      }
      isAnimating = false;
      updatePaginationUI();
      if (typeof onComplete === 'function') onComplete();
    }
  });
}

/**
 * ANIMACIÓN DE LA MANO QUE PASA LA PÁGINA (FLIP 3D REALISTA SIN HUECOS NI TRANSPARENCIAS)
 */
function animateHandPageTurn(direction, fromIndex, targetIndex, onTurnComplete) {
  const hand = document.getElementById('turningHand');
  const bookElement = document.getElementById('bookElement');
  const spreadContainer = document.getElementById('spreadContainer');

  if (!hand || !bookElement || !spreadContainer || fromIndex === undefined || targetIndex === undefined) {
    if (typeof onTurnComplete === 'function') onTurnComplete();
    return;
  }

  // Guardar inmediatamente cualquier texto que esté siendo tipeado antes de girar la hoja
  flushActiveEditing();

  const currentLeft = getSpreadLeftHtml(fromIndex);
  const currentRight = getSpreadRightHtml(fromIndex);
  const targetLeft = getSpreadLeftHtml(targetIndex);
  const targetRight = getSpreadRightHtml(targetIndex);

  hand.classList.remove('hidden');

  if (direction === 'next') {
    // 1. Capa base inferior: Izquierda actual visible, y derecha nueva ya esperando debajo
    spreadContainer.innerHTML = `
      <div class="open-spread-leaf left-leaf" id="leftLeaf">
        <div class="leaf-paper-surface">
          ${currentLeft}
        </div>
      </div>
      <div class="open-spread-leaf right-leaf" id="rightLeaf">
        <div class="leaf-paper-surface">
          ${targetRight}
        </div>
      </div>
    `;

    // 2. Hoja física 3D que gira sobre el lomo
    // Cara frontal: el contenido derecho actual
    // Cara posterior: el nuevo contenido izquierdo que aterrizará a la izquierda
    const turnLeaf = document.createElement('div');
    turnLeaf.className = 'physical-turning-leaf turning-right-to-left';
    turnLeaf.innerHTML = `
      <div class="leaf-turn-face face-front">
        <div class="leaf-paper-surface">
          ${currentRight}
        </div>
        <div class="page-curl-shadow"></div>
      </div>
      <div class="leaf-turn-face face-back">
        <div class="leaf-paper-surface">
          ${targetLeft}
        </div>
        <div class="page-curl-shadow back-shadow"></div>
      </div>
    `;
    bookElement.appendChild(turnLeaf);

    const tl = gsap.timeline({
      onComplete: () => {
        turnLeaf.remove();
        hand.classList.add('hidden');
        if (typeof onTurnComplete === 'function') onTurnComplete();
      }
    });

    // Movimiento sincronizado: la mano entra, sujeta el papel y lo voltea hacia la izquierda
    tl.fromTo(hand, 
      { x: 95, y: 115, opacity: 0, rotate: 15, scale: 0.9 }, 
      { x: 22, y: 35, opacity: 1, rotate: -4, scale: 1, duration: 0.32, ease: 'power2.out' }
    )
    .to(hand, { scale: 0.95, duration: 0.08 })
    .to(turnLeaf, {
      rotateY: -180,
      duration: 0.76,
      ease: 'power2.inOut'
    }, 'turnTogether')
    .to(hand, {
      x: -210,
      y: 12,
      rotate: -32,
      duration: 0.76,
      ease: 'power2.inOut'
    }, 'turnTogether')
    .to(hand, {
      y: 85,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.1');

  } else {
    // RETROCEDIENDO DE PÁGINA:
    // 1. Capa base inferior: Nueva izquierda esperando debajo, y derecha actual
    spreadContainer.innerHTML = `
      <div class="open-spread-leaf left-leaf" id="leftLeaf">
        <div class="leaf-paper-surface">
          ${targetLeft}
        </div>
      </div>
      <div class="open-spread-leaf right-leaf" id="rightLeaf">
        <div class="leaf-paper-surface">
          ${currentRight}
        </div>
      </div>
    `;

    // 2. Hoja física que gira de izquierda a derecha
    const turnLeaf = document.createElement('div');
    turnLeaf.className = 'physical-turning-leaf turning-left-to-right';
    turnLeaf.innerHTML = `
      <div class="leaf-turn-face face-front">
        <div class="leaf-paper-surface">
          ${currentLeft}
        </div>
        <div class="page-curl-shadow"></div>
      </div>
      <div class="leaf-turn-face face-back">
        <div class="leaf-paper-surface">
          ${targetRight}
        </div>
        <div class="page-curl-shadow back-shadow"></div>
      </div>
    `;
    bookElement.appendChild(turnLeaf);

    const tl = gsap.timeline({
      onComplete: () => {
        turnLeaf.remove();
        hand.classList.add('hidden');
        if (typeof onTurnComplete === 'function') onTurnComplete();
      }
    });

    tl.fromTo(hand, 
      { x: -120, y: 115, opacity: 0, rotate: -20, scale: 0.9 }, 
      { x: -35, y: 35, opacity: 1, rotate: 6, scale: 1, duration: 0.32, ease: 'power2.out' }
    )
    .to(hand, { scale: 0.95, duration: 0.08 })
    .to(turnLeaf, {
      rotateY: 180,
      duration: 0.76,
      ease: 'power2.inOut'
    }, 'turnTogether')
    .to(hand, {
      x: 190,
      y: 12,
      rotate: 25,
      duration: 0.76,
      ease: 'power2.inOut'
    }, 'turnTogether')
    .to(hand, {
      y: 85,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.1');
  }
}

export function nextSpread() {
  if (isAnimating || currentSpreadIndex >= totalSpreadsCount - 1) return;
  flushActiveEditing();
  goToSpread(currentSpreadIndex + 1);
}

export function prevSpread() {
  if (isAnimating || currentSpreadIndex <= 0) return;
  flushActiveEditing();
  goToSpread(currentSpreadIndex - 1);
}

export function goToSpread(targetIndex) {
  if (isAnimating || targetIndex === currentSpreadIndex || targetIndex < 0 || targetIndex >= totalSpreadsCount) return;

  flushActiveEditing();
  isAnimating = true;
  pauseAllVideos();
  playPageFlipSound();

  const isForward = targetIndex > currentSpreadIndex;
  const direction = isForward ? 'next' : 'prev';
  const fromIndex = currentSpreadIndex;

  // Ejecutar animación de la mano y pasar la página con la hoja física 3D
  animateHandPageTurn(direction, fromIndex, targetIndex, () => {
    currentSpreadIndex = targetIndex;
    renderCurrentSpread();
    updatePaginationUI();
    isAnimating = false;

    // Si llegamos al spread final, lanzar confeti
    if (targetIndex === totalSpreadsCount - 1) {
      triggerCelebrationConfetti();
    }
  });
}

function setupPaginationDots() {
  const dotsContainer = document.getElementById('dotsPagination');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = '';
  const maxDots = Math.min(totalSpreadsCount, 9);
  for (let i = 0; i < maxDots; i++) {
    const dot = document.createElement('div');
    dot.className = `track-dot ${i === 0 ? 'active' : ''}`;
    dot.dataset.targetIndex = Math.round((i / (maxDots - 1)) * (totalSpreadsCount - 1));
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = parseInt(dot.dataset.targetIndex, 10);
      goToSpread(target);
    });
    dotsContainer.appendChild(dot);
  }
}

function setupBookEvents() {
  const bookElement = document.getElementById('bookElement');
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevSpread(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSpread(); });

  // Lightbox para ampliar fotos en pantalla completa
  document.addEventListener('click', (e) => {
    const zoomBtn = e.target.closest('.btn-zoom-photo');
    const photoImg = e.target.closest('.zoomable-photo');
    if ((zoomBtn || photoImg) && lightboxModal && lightboxImg) {
      e.stopPropagation();
      const frame = (zoomBtn || photoImg).closest('.archival-photo-mount');
      const img = frame ? frame.querySelector('img') : null;
      if (img) {
        lightboxImg.src = img.src;
        if (lightboxCaption) {
          const title = frame.querySelector('.photo-caption-title');
          lightboxCaption.textContent = title ? title.textContent : '';
        }
        lightboxModal.showModal();
      }
    }
  });

  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => lightboxModal.close());
  }

  // Teclado
  window.addEventListener('keydown', (e) => {
    if (e.target.isContentEditable) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      nextSpread();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevSpread();
    }
  });

  // Tocar / Clic en el libro para pasar de página con la mano
  if (bookElement) {
    let startX = 0;
    let startY = 0;
    let isTouching = false;

    bookElement.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      if (e.target.closest('video') || e.target.isContentEditable || e.target.closest('[data-field-key]') || e.target.closest('button')) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isTouching = true;
    }, { passive: true });

    bookElement.addEventListener('touchend', (e) => {
      if (!isTouching || e.changedTouches.length !== 1) return;
      isTouching = false;

      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;

      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) {
          nextSpread();
        } else {
          prevSpread();
        }
      }
    }, { passive: true });

    // Al hacer clic en la hoja, la mano pasa la página
    bookElement.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit-journal') || 
          e.target.closest('video') || 
          e.target.isContentEditable ||
          e.target.closest('[data-field-key]') ||
          e.target.closest('.btn-celebrate-love') ||
          e.target.closest('.btn-zoom-photo') ||
          e.target.closest('button')) {
        return;
      }

      // Si la portada aún está cerrada, un clic la abre
      if (!isCoverOpen) {
        openBookCoverPhysical();
        return;
      }

      const rect = bookElement.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // Clic en la mitad izquierda = volver atrás
      if (clickX < rect.width * 0.45 && currentSpreadIndex > 0) {
        prevSpread();
      } else {
        // Clic en la mitad derecha = pasar adelante con la mano
        nextSpread();
      }
    });
  }
}

export function resetBookToClosedState() {
  flushActiveEditing();
  pauseAllVideos();
  const bookElement = document.getElementById('bookElement');
  const coverLeaf = document.getElementById('bookCoverLeaf');
  if (bookElement) {
    bookElement.classList.add('book-is-closed');
  }
  if (coverLeaf) {
    coverLeaf.style.zIndex = '40';
    gsap.set(coverLeaf, { rotateY: 0 });
  }
  isCoverOpen = false;
  currentSpreadIndex = 0;
  renderCurrentSpread();
  updatePaginationUI();
}
