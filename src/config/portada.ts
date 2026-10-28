// Portada animada: único lugar para cambiar textos, botones, videos y tiempos de la animación.
// Edita aquí sin tocar el diseño. Ver src/components/portada/Portada.jsx.

export const PORTADA = {
  // Video recorrido con el scroll. Todos sus cuadros son keyframes (ffmpeg -g 1), por eso el scrub es fluido.
  // El de móvil es más liviano (480p). Los posters son el primer y el último cuadro.
  video: { escritorio: '/portada/portada-720.mp4', movil: '/portada/portada-480.mp4' },
  posters: {
    inicio: { src: '/portada/inicio-1280.webp', srcSet: '/portada/inicio-640.webp 640w, /portada/inicio-1280.webp 1280w' },
    plato: { src: '/portada/plato-1280.webp', srcSet: '/portada/plato-640.webp 640w, /portada/plato-1280.webp 1280w' },
  },

  // Pantalla 1: Bruno
  pantalla1: {
    etiqueta: 'Entregamos en Bogotá',
    titulo: 'Buena comida para quien te espera en casa',
    texto: 'Alimento para gatos y perros, desde marcas de siempre hasta dietas veterinarias. Elige con calma y te lo llevamos.',
    boton: { texto: 'Ver el catálogo', to: '/catalogo' },
    // Dos frases cortas (en escritorio van a la derecha; en móvil se omiten)
    datos: ['24 marcas, de uso diario a dietas veterinarias.', 'Te ayudamos a elegir por edad, peso y necesidad.'],
    // Tarjeta pequeña: abre el WhatsApp de la tienda (número en src/config/store.ts)
    tarjeta: { titulo: 'Pide por WhatsApp', texto: 'Respondemos hoy' },
  },

  // Transición: la cámara entra en la croqueta
  transicion: { texto: 'Cada croqueta, bien elegida' },

  // Pantalla 2: el plato
  pantalla2: {
    titulo: 'Llénale el plato hoy',
    texto: 'Te lo llevamos en Bogotá. Elige por marca, peso o necesidad.',
    boton: { texto: 'Ver el catálogo', to: '/catalogo' },
    botonSecundario: { texto: 'Para mi gato', to: '/catalogo?animal=gato' },
  },

  // Zonas de scroll de cada texto, de 0 (arriba) a 1 (fin de la animación):
  // [empieza a aparecer, ya está completo, empieza a irse, ya se fue].
  // Entre un texto y el siguiente hay una pausa: solo se ve el video.
  // Referencia del video (15,2 s): Bruno 0–3,5 s · la croqueta crece 5–8,8 s · destello ~9,7 s · plato 10,6–15,2 s.
  zonas: {
    pantalla1: [0, 0, 0.22, 0.32],
    transicion: [0.36, 0.42, 0.54, 0.6],
    pantalla2: [0.78, 0.86, 1.1, 1.2],
  },

  // Largo del recorrido, en alturas de pantalla. Más alto = animación más lenta al hacer scroll.
  alturaPista: 2.3,
};
