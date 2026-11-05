/**
 * =========================================================================
 * MÓDULO DE EDICIÓN Y PERSISTENCIA (LOCALSTORAGE + EXPORTACIÓN)
 * =========================================================================
 */

const STORAGE_KEY = 'feliz_mes_album_captions_v2';

export function getSavedCaptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCaption(pageId, text) {
  try {
    const data = getSavedCaptions();
    data[pageId] = text.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Error al guardar en localStorage:', e);
  }
}

export function getActiveCaption(pageId, defaultText) {
  const saved = getSavedCaptions();
  return saved[pageId] !== undefined ? saved[pageId] : defaultText;
}

export function resetAllCaptions() {
  localStorage.removeItem(STORAGE_KEY);
}

export function initEditorSystem({ onSave } = {}) {
  const editToggleBtn = document.getElementById('btnEditToggle');
  const editNotice = document.getElementById('editNotice');
  const btnCloseNotice = document.getElementById('btnCloseNotice');
  const exportModal = document.getElementById('exportModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCopyJson = document.getElementById('btnCopyJson');
  const btnResetDefaults = document.getElementById('btnResetDefaults');
  const copyStatus = document.getElementById('copyStatus');

  let isEditMode = false;

  function setEditMode(active) {
    isEditMode = active;
    if (editToggleBtn) {
      editToggleBtn.classList.toggle('active', active);
    }
    if (editNotice) {
      editNotice.classList.toggle('hidden', !active);
    }

    document.querySelectorAll('.journal-handwritten-text, .dedication-body').forEach(el => {
      el.contentEditable = active ? 'true' : 'false';
      const box = el.closest('.journal-entry-box');
      if (box) {
        box.classList.toggle('editing-focused', active);
      }
    });
  }

  if (editToggleBtn) {
    editToggleBtn.addEventListener('click', () => {
      setEditMode(!isEditMode);
    });

    let pressTimer;
    editToggleBtn.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => {
        if (exportModal) exportModal.showModal();
      }, 700);
    });
    editToggleBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
  }

  if (btnCloseNotice) {
    btnCloseNotice.addEventListener('click', () => {
      if (editNotice) editNotice.classList.add('hidden');
    });
  }

  document.addEventListener('focusout', (e) => {
    const target = e.target;
    if (target.classList && target.classList.contains('journal-handwritten-text')) {
      const pageId = target.dataset.pageId;
      const text = target.innerText;
      if (pageId) {
        saveCaption(pageId, text);
        if (typeof onSave === 'function') onSave(pageId, text);
      }
    } else if (target.classList && target.classList.contains('dedication-body')) {
      saveCaption('dedication', target.innerText);
    }
  });

  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-journal');
    if (editBtn) {
      const box = editBtn.closest('.journal-entry-box');
      if (box) {
        const paragraph = box.querySelector('.journal-handwritten-text');
        if (paragraph) {
          paragraph.contentEditable = 'true';
          box.classList.add('editing-focused');
          paragraph.focus();

          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(paragraph);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  });

  if (btnCloseModal && exportModal) {
    btnCloseModal.addEventListener('click', () => exportModal.close());
  }

  if (btnCopyJson) {
    btnCopyJson.addEventListener('click', () => {
      const saved = getSavedCaptions();
      navigator.clipboard.writeText(JSON.stringify(saved, null, 2))
        .then(() => {
          if (copyStatus) {
            copyStatus.classList.remove('hidden');
            setTimeout(() => copyStatus.classList.add('hidden'), 2500);
          }
        })
        .catch(() => alert('No se pudo copiar.'));
    });
  }

  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar todas las descripciones a las originales?')) {
        resetAllCaptions();
        location.reload();
      }
    });
  }

  return {
    isEditMode: () => isEditMode,
    setEditMode
  };
}
