/**
 * =========================================================================
 * ARCHIVO PRINCIPAL (MAIN.JS) — INICIALIZACIÓN DE LA EXPERIENCIA
 * =========================================================================
 */
import { ALBUM_CONFIG } from './data.js';
import { 
  buildTwoPageBook, 
  openBookCoverPhysical, 
  resetBookToClosedState, 
  toggleNatureSound 
} from './album.js';
import { initEditorSystem } from './editor.js';
import { 
  animateWelcomeIn, 
  animateForestToPedestalZoom, 
  animateBackToForest 
} from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inyectar datos en la pantalla de bienvenida panorámica
  const welcomeAnniversary = document.getElementById('welcomeAnniversary');
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeSubtitle = document.getElementById('welcomeSubtitle');

  if (welcomeAnniversary) welcomeAnniversary.textContent = ALBUM_CONFIG.anniversaryText;
  if (welcomeTitle) welcomeTitle.textContent = ALBUM_CONFIG.coupleNames;
  if (welcomeSubtitle) welcomeSubtitle.textContent = ALBUM_CONFIG.subheading;

  // 2. Construir el libro de dos páginas abiertas (spreads)
  buildTwoPageBook();

  // 3. Inicializar sistema de edición y persistencia local
  initEditorSystem({
    onSave: (pageId, newText) => {
      console.log(`[Guardado] Recuerdo ${pageId}: ${newText.substring(0, 30)}...`);
    }
  });

  // 4. Animación de entrada inicial del claro del bosque
  animateWelcomeIn();

  // 5. Botón principal: Acercamiento cinemático de cámara hacia el atril de piedra
  const btnOpenAlbum = document.getElementById('btnOpenAlbum');
  if (btnOpenAlbum) {
    btnOpenAlbum.addEventListener('click', () => {
      // Iniciar sonido ambiental de bosque, pajaritos y viento
      const isPlaying = toggleNatureSound(true);
      updateSoundButtonUI(isPlaying);

      // Lanzar zoom de cámara hacia el atril de piedra y apertura física de la portada 3D
      animateForestToPedestalZoom({
        onOpenCover: () => {
          openBookCoverPhysical(() => {
            console.log('[Álbum] Portada abierta físicamente, dos páginas desplegadas');
          });
        },
        onComplete: () => {
          console.log('[Álbum] Secuencia cinemática completada');
        }
      });
    });
  }

  // 6. Botón de inicio: regresar a la vista panorámica del bosque
  const btnHome = document.getElementById('btnHome');
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      animateBackToForest();
      setTimeout(resetBookToClosedState, 450);
    });
  }

  // 7. Botón de control de sonido ambiental
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      const isPlaying = toggleNatureSound();
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
});
