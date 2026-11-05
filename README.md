# 📖 Joaquin & Lu — 1 Año y 7 Meses ❤️

Álbum interactivo de aniversario con efecto *page-flip* 3D, soporte para fotos y videos, descripciones editables en tiempo real, ambientación de olas marinas y diseño editorial para móviles y escritorio.

Hecho con **Vite**, **GSAP**, **Canvas-Confetti** y las directrices de diseño editorial **Impeccable** & **Taste-Skill**.

---

## 🎨 Características

- **Diseño Editorial Noble:** Paleta en guinda noble (`#540d1e`), azul marino crepuscular (`#0a1122`) y destellos en oro y arena.
- **Efecto Libro 3D:** Animación fluida de paso de páginas con rotación tridimensional y sombras de lomo.
- **Totalmente Responsive (Mobile-First):** Diseñado específicamente para verse como un álbum físico íntimo en teléfonos (iPhone / Android) y expandirse en tabletas y ordenadores.
- **Soporte de Gestos:** Desliza (swipe táctil) para pasar de página en tu teléfono, o usa las flechas del teclado en el ordenador.
- **Descripciones Editables:**
  - Pulsa el botón **Editar** en la barra superior o el lápiz en cualquier recuerdo para cambiar los textos directamente en la pantalla.
  - Los textos se guardan automáticamente en tu navegador (`localStorage`).
- **Archivo de Configuración Directo (`src/data.js`):** Cambia el orden de las fotos, los títulos, la dedicatoria o el mensaje final en un único archivo.
- **Audio Ambiental Suave:** Sonido sintetizado de olas de mar crepusculares y crujido de paso de página (vía Web Audio API, sin descargas pesadas).

---

## 🚀 Despliegue en GitHub Pages

Este proyecto incluye un flujo de trabajo automatizado en `.github/workflows/deploy.yml`.

Para activar el link público:
1. En GitHub, entra a tu repositorio: `https://github.com/JaxD17/FelizMess`
2. Ve a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
4. ¡Listo! Cada vez que subas cambios a la rama `main`, tu página se compilará y se publicará automáticamente en:
   **`https://JaxD17.github.io/FelizMess/`**

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build

# Previsualizar la compilación de producción
npm run preview
```
