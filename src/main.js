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
  animatePedestalArrival, 
  animateBackToForest 
} from './animations.js';
import { forestJourney } from './forest-journey.js';

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

  // 4. Iniciar el viaje vivo por el bosque encantado (perrito, árboles, pájaros)
  forestJourney.init({
    onPedestalReached: () => {
      // Iniciar sonido ambiental de bosque, pajaritos y viento
      const isPlaying = toggleNatureSound(true);
      updateSoundButtonUI(isPlaying);

      // La cámara llega frente al atril de piedra y EN ESE MOMENTO aparece el libro
      animatePedestalArrival({
        onBookRevealed: () => {
          console.log('[Álbum] Libro revelado en el atril, listo para abrirse');
          updateRotateHintVisibility();
        }
      });
    }
  });

  // 5. Animación de entrada inicial del paseo
  animateWelcomeIn();

  // 6. Al hacer clic en el libro cerrado, se abre físicamente en 3D
  const bookCoverLeaf = document.getElementById('bookCoverLeaf');
  if (bookCoverLeaf) {
    bookCoverLeaf.addEventListener('click', () => {
      openBookCoverPhysical(() => {
        console.log('[Álbum] Portada abierta físicamente, dos páginas desplegadas');
      });
    });
  }

  // 7. Botón de inicio: regresar al paseo por el bosque
  const btnHome = document.getElementById('btnHome');
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      animateBackToForest();
      if (rotateHint) rotateHint.classList.add('hidden');
      setTimeout(resetBookToClosedState, 450);
    });
  }

  // 8. Botón de control de sonido ambiental
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      const isPlaying = toggleNatureSound();
      updateSoundButtonUI(isPlaying);
    });
  }

  // 9. Guía para rotar a horizontal (estilo Paper by WeTransfer para disfrutar el álbum en grande)
  const rotateHint = document.getElementById('rotatePhoneHint');
  const btnDismissRotate = document.getElementById('btnDismissRotate');
  let isRotateDismissed = false;

  if (btnDismissRotate) {
    btnDismissRotate.addEventListener('click', (e) => {
      e.stopPropagation();
      isRotateDismissed = true;
      if (rotateHint) rotateHint.classList.add('hidden');
    });
  }

  function updateRotateHintVisibility() {
    if (!rotateHint || isRotateDismissed) return;
    const albumApp = document.getElementById('albumApp');
    const isAlbumVisible = albumApp && !albumApp.classList.contains('hidden');
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.innerHeight > window.innerWidth;

    if (isAlbumVisible && isMobile && isPortrait) {
      rotateHint.classList.remove('hidden');
    } else {
      rotateHint.classList.add('hidden');
    }
  }

  window.addEventListener('resize', updateRotateHintVisibility);
  window.addEventListener('orientationchange', updateRotateHintVisibility);

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
