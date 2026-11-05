/**
 * =========================================================================
 * MÓDULO DE EDICIÓN Y PERSISTENCIA (LOCALSTORAGE + TIEMPO REAL)
 * Guarda inmediatamente textos, títulos de cartas, títulos de fotos y fechas
 * sin perder nada al cambiar de página o rotar la pantalla.
 * =========================================================================
 */

const STORAGE_KEY = 'feliz_mes_album_captions_v4';

export function getSavedFields() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveField(key, text) {
  if (!key) return;
  try {
    const data = getSavedFields();
    data[key] = text;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Storage] Error al guardar campo:', e);
  }
}

export function getActiveField(key, defaultValue) {
  const data = getSavedFields();
  if (data[key] !== undefined && data[key] !== null) {
    return data[key];
  }
  return defaultValue !== undefined ? defaultValue : '';
}

// Compatibilidad con llamadas heredadas
export function getActiveCaption(pageId, defaultText) {
  return getActiveField(pageId, defaultText);
}

export function saveCaption(pageId, text) {
  saveField(pageId, text);
}

export function resetAllCaptions() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Guarda inmediatamente cualquier campo de texto que esté siendo editado
 */
export function flushActiveEditing() {
  const activeEl = document.activeElement;
  if (activeEl && activeEl.dataset && activeEl.dataset.fieldKey) {
    const key = activeEl.dataset.fieldKey;
    const text = activeEl.innerText;
    saveField(key, text);
  }
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
    document.body.classList.toggle('edit-mode-active', active);

    if (editToggleBtn) {
      editToggleBtn.classList.toggle('active', active);
    }
    if (editNotice) {
      editNotice.classList.toggle('hidden', !active);
    }

    // Activar contentEditable en todos los campos con data-field-key
    document.querySelectorAll('[data-field-key]').forEach(el => {
      el.contentEditable = active ? 'true' : 'false';
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
    }, { passive: true });
    editToggleBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
  }

  if (btnCloseNotice) {
    btnCloseNotice.addEventListener('click', () => {
      if (editNotice) editNotice.classList.add('hidden');
    });
  }

  // GUARDADO INMEDIATO EN TIEMPO REAL AL ESCRIBIR (Evita perder texto al cambiar de página)
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.fieldKey) {
      const key = target.dataset.fieldKey;
      const text = target.innerText;
      saveField(key, text);
      if (typeof onSave === 'function') onSave(key, text);
    }
  });

  // Guardado adicional de seguridad al desenfocar
  document.addEventListener('focusout', (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.fieldKey) {
      const key = target.dataset.fieldKey;
      const text = target.innerText;
      saveField(key, text);
    }
  });

  // Botón lápiz en la cabecera del diario: activa edición y enfoca el texto
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-journal');
    if (editBtn) {
      e.stopPropagation();
      setEditMode(true);
      const box = editBtn.closest('.journal-entry-box');
      if (box) {
        const paragraph = box.querySelector('.journal-handwritten-text');
        if (paragraph) {
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
      const saved = getSavedFields();
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
      if (confirm('¿Deseas restaurar todos los textos y títulos a sus valores originales?')) {
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
