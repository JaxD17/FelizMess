/**
 * =========================================================================
 * 💌 CONFIGURACIÓN DEL ÁLBUM DE NUESTRO ANIVERSARIO (1 AÑO Y 7 MESES) 💌
 * =========================================================================
 * Aquí puedes cambiar los textos, títulos, dedicatoria y el orden de fotos
 * o videos. ¡Cualquier cambio aquí se reflejará directamente en el álbum!
 */

export const ALBUM_CONFIG = {
  // Datos principales de la portada y bienvenida
  anniversaryText: "1 Año y 7 Meses",
  coupleNames: "Joaquin & Lu",
  subheading: "Nuestro álbum de recuerdos a la orilla del mar",
  welcomeButtonText: "Abrir Nuestro Álbum",

  // Portada interna del libro (dedicatoria)
  dedicationTitle: "Para mi persona favorita",
  dedicationBody: `Desde el primer día supe que contigo todo sería diferente.
Cada risa, cada salida, cada abrazo y cada momento que hemos vivido juntos
han sido los mejores 19 meses de mi vida.

Este álbum es un pedacito de nosotros, de nuestra historia y de lo mucho que te amo.`,

  // Mensaje final (última página)
  finalTitle: "¡Feliz 1 Año y 7 Meses, Mi Amor!",
  finalMessage: `Gracias por ser mi paz, mi refugio, mi mejor amiga y el amor de mi vida.
Por cada puesta de sol juntos, por cada caricia y por cada día que viene.
Que este sea solo el inicio de todo lo hermoso que aún nos falta por vivir.

Te amo con todo mi corazón ❤️`,
  finalSignature: "Siempre tuyo, Joaquin"
};

/**
 * =========================================================================
 * 📸 PÁGINAS DEL ÁLBUM (FOTOS Y VIDEOS)
 * =========================================================================
 * Puedes reordenar los elementos cortando y pegando el bloque { ... }
 * Para cambiar la descripción, edita el campo `defaultCaption`.
 * Si quieres agregar más, coloca la foto en 'public/photos/' y añade una entrada aquí.
 */
export const albumPages = [
  {
    id: "page-1",
    type: "photo",
    src: "photos/01-juntos-calle.jpg",
    title: "Nuestra noche favorita",
    date: "Caminando juntos",
    defaultCaption: "Juntos de noche en la calle, compartiendo momentos que nunca voy a olvidar. A tu lado cualquier lugar se vuelve mágico."
  },
  {
    id: "page-2",
    type: "photo",
    src: "photos/02-selfie-corazones.jpg",
    title: "Esa sonrisa tuya",
    date: "Lleno de amor",
    defaultCaption: "Esa carita y esa sonrisa tuya que me enamoran cada día más. Me haces el hombre más afortunado del mundo."
  },
  {
    id: "page-3",
    type: "photo",
    src: "photos/03-con-los-bebes.jpg",
    title: "Momentos en familia",
    date: "Tardes llenas de ternura",
    defaultCaption: "Con los más pequeños de la casa. Verte sonreír así me llena el corazón de una manera inexplicable."
  },
  {
    id: "page-4",
    type: "photo",
    src: "photos/04-selfie-perritos.jpg",
    title: "Nuestras locuras",
    date: "Risas compartidas",
    defaultCaption: "Haciendo caras graciosas y siendo nosotros mismos. No cambio nuestras risas y complicidad por absolutamente nada."
  },
  {
    id: "page-5",
    type: "photo",
    src: "photos/05-cupcakes.jpg",
    title: "Detalles dulces",
    date: "Hecho con amor",
    defaultCaption: "Un detalle dulce para nosotros, porque cada pequeño recuerdo a tu lado vale oro."
  },
  {
    id: "page-6",
    type: "photo",
    src: "photos/06-flor.jpg",
    title: "Una flor para ti",
    date: "De mi mano a la tuya",
    defaultCaption: "Una flor para la flor más hermosa de todo mi mundo. Sostener tu mano es mi lugar favorito en la tierra."
  },
  {
    id: "page-7",
    type: "photo",
    src: "photos/07-con-snoopy.png",
    title: "Ternura pura",
    date: "Abrazando a Snoopy",
    defaultCaption: "Te ves tan tierna y hermosa abrazando a Snoopy... Cada detalle tuyo me fascina."
  },
  {
    id: "page-8",
    type: "photo",
    src: "photos/08-peluches.jpg",
    title: "Nuestros compañeros",
    date: "Snoopy & Stitch",
    defaultCaption: "Nuestros peluches favoritos, testigos silenciosos de tanto cariño, risas y momentos inolvidables juntos."
  },
  {
    id: "page-9",
    type: "photo",
    src: "photos/09-en-la-sala.jpg",
    title: "Tardes de calma",
    date: "En casa contigo",
    defaultCaption: "Esas tardes tranquilas en casa, donde no hace falta nada más que estar juntos para sentir que lo tenemos todo."
  },
  {
    id: "page-10",
    type: "photo",
    src: "photos/10-tatuaje-L.jpg",
    title: "Siempre conmigo",
    date: "Para siempre",
    defaultCaption: "Llevándote en mi piel, en mi mente y en cada latido de mi corazón. Mi 'L' favorita."
  },
  {
    id: "page-11",
    type: "photo",
    src: "photos/11-principito.jpg",
    title: "Nuestra rosa y el zorro",
    date: "Lo esencial",
    defaultCaption: "«Eres responsable para siempre de lo que has domesticado. Eres responsable de tu rosa». Tú eres mi rosa única en el universo."
  },
  {
    id: "page-12",
    type: "photo",
    src: "photos/12-vanellope.jpg",
    title: "Mi dulce traviesa",
    date: "Tan única como tú",
    defaultCaption: "Con la personalidad más linda, divertida y dulce. No hay nadie en este mundo que se compare contigo."
  },
  {
    id: "page-13",
    type: "video",
    src: "photos/video-1.mp4",
    title: "Un momento en video",
    date: "Grabado con amor",
    defaultCaption: "Un instante grabado para recordar cómo se siente estar aquí juntos. ¡Dale play para revivirlo!"
  },
  {
    id: "page-14",
    type: "video",
    src: "photos/video-2.mp4",
    title: "Nuestra vibra",
    date: "Espontáneo",
    defaultCaption: "Nuestra vibra juntos, momentos espontáneos que guardo como el tesoro más preciado."
  },
  {
    id: "page-15",
    type: "video",
    src: "photos/video-3.mp4",
    title: "Risas inolvidables",
    date: "Inolvidable",
    defaultCaption: "Nuestras risas y la alegría de estar el uno con el otro. Que nunca se acabe esta magia."
  }
];
