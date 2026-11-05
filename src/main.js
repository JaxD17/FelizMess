/**
 * =========================================================================
 * ARCHIVO PRINCIPAL (MAIN.JS) — INICIALIZACIÓN DE LA APLICACIÓN
 * =========================================================================
 */
import { ALBUM_CONFIG } from './data.js';
import { buildBookPages, resetBookToCover, toggleOceanSound, nextPage } from './album.js';
import { initEditorSystem } from './editor.js';
import { animateWelcomeIn, animateShrekOpening, animateBackToWelcome } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inyectar datos dinámicos en la pantalla de bienvenida
  const welcomeAnniversary = document.getElementById('welcomeAnniversary');
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeSubtitle = document.getElementById('welcomeSubtitle');
  const btnOpenLabel = document.getElementById('btnOpenLabel');

  if (welcomeAnniversary) welcomeAnniversary.textContent = ALBUM_CONFIG.anniversaryText;
  if (welcomeTitle) welcomeTitle.textContent = ALBUM_CONFIG.coupleNames;
  if (welcomeSubtitle) welcomeSubtitle.textContent = ALBUM_CONFIG.subheading;
  if (btnOpenLabel) btnOpenLabel.textContent = ALBUM_CONFIG.welcomeButtonText;

  // 2. Construir páginas del álbum
  buildBookPages();

  // 3. Inicializar sistema de edición inline y almacenamiento local
  initEditorSystem({
    onSave: (pageId, newText) => {
      console.log(`[Guardado] Página ${pageId}: ${newText.substring(0, 30)}...`);
    }
  });

  // 4. Lanzar animación de entrada en la bienvenida
  animateWelcomeIn();

  // 5. Botón principal: Apertura cinemática estilo Shrek
  const btnOpenAlbum = document.getElementById('btnOpenAlbum');
  if (btnOpenAlbum) {
    btnOpenAlbum.addEventListener('click', () => {
      // Iniciar oleaje suave
      const isPlaying = toggleOceanSound(true);
      updateSoundButtonUI(isPlaying);

      // Lanzar secuencia cinemática: acercamiento de cámara + apertura de portada
      animateShrekOpening({
        onOpenCover: () => {
          nextPage();
        },
        onComplete: () => {
          console.log('[Álbum] Apertura cinemática completada');
        }
      });
    });
  }

  // 6. Botón de inicio (volver a la bienvenida)
  const btnHome = document.getElementById('btnHome');
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      animateBackToWelcome();
      setTimeout(resetBookToCover, 400);
    });
  }

  // 7. Botón de control de sonido ambiente (Olas de mar)
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      const isPlaying = toggleOceanSound();
      updateSoundButtonUI(isPlaying);
    });
  }

  function updateSoundButtonUI(isPlaying) {
    const offIcon = document.querySelector('.sound-off-icon');
    const onIcon = document.querySelector('.sound-on-icon');
    if (offIcon && onIcon) {
      offIcon.classList.toggle('hidden', isPlaying);
      onIcon.classList.toggle('hidden', !isPlaying);
    }
    if (btnSoundToggle) {
      btnSoundToggle.classList.toggle('active', isPlaying);
    }
  }

  // 8. Efecto táctil de destellos y corazones al tocar la pantalla
  setupSparkleTouch();
});

function setupSparkleTouch() {
  const symbols = ['✨', '💖', '⭐', '🐚', '🌊'];
  let lastSpawn = 0;

  function createSparkle(x, y) {
    const now = Date.now();
    if (now - lastSpawn < 90) return;
    lastSpawn = now;

    const el = document.createElement('span');
    el.className = 'touch-sparkle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 900);
  }

  window.addEventListener('click', (e) => {
    if (!e.target.closest('button') && !e.target.isContentEditable) {
      createSparkle(e.clientX, e.clientY);
    }
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (!e.target.closest('button') && !e.target.isContentEditable) {
        createSparkle(touch.clientX, touch.clientY);
      }
    }
  }, { passive: true });
}
