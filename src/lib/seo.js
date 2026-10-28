// Textos de SEO por página. Puro (sin DOM ni imports): lo usan la app (usePagina) y
// scripts/postbuild.js, que escribe estas mismas etiquetas en el HTML estático de cada ruta.

export const NOMBRE_SITIO = 'La Tienda de Pocho';
export const IMAGEN_OG_DEFECTO = '/og-default.jpg';

export function recortar(texto, max = 155) {
  const t = String(texto ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  return `${corte.slice(0, corte.lastIndexOf(' ') > 60 ? corte.lastIndexOf(' ') : corte.length).replace(/[,.;:\s]+$/, '')}…`;
}

const para = (tipo) => (tipo === 'felino' ? 'gatos' : 'perros');

// Rutas fijas. `sinSufijo`: el título ya incluye el nombre del sitio. `noindex`: no debe aparecer en buscadores.
export const META_ESTATICAS = {
  '/': {
    titulo: 'La Tienda de Pocho · Alimento para gatos y perros en Bogotá',
    sinSufijo: true,
    descripcion: 'Alimento para gatos y perros de 24 marcas, de uso diario a dietas veterinarias. Arma tu pedido y confírmalo por WhatsApp. Entregas en Bogotá.',
  },
  '/catalogo': {
    titulo: 'Catálogo de alimento para gatos y perros',
    descripcion: 'Explora el catálogo: filtra por marca, precio, presentación y necesidad. Alimento para gatos y perros con entrega en Bogotá.',
  },
  '/nosotros': {
    titulo: 'Sobre nosotros',
    descripcion: 'La Tienda de Pocho vende alimento y accesorios para mascotas en Bogotá, con marcas de uso diario y dietas veterinarias.',
  },
  '/contacto': {
    titulo: 'Contacto',
    descripcion: 'Escríbenos para elegir el alimento de tu mascota, consultar disponibilidad o resolver dudas de tu pedido. Atendemos en Bogotá.',
  },
  '/envios-y-devoluciones': {
    titulo: 'Envíos y devoluciones',
    descripcion: 'Entregamos en Bogotá. El costo y la disponibilidad del envío se confirman por WhatsApp según tu zona. Conoce cómo funcionan los cambios.',
  },
  '/ingresar': { titulo: 'Ingresar', descripcion: 'Ingresa a La Tienda de Pocho con tu número de WhatsApp. Sin contraseñas.', noindex: true },
  '/carrito': { titulo: 'Carrito', descripcion: 'Tu carrito de compras en La Tienda de Pocho.', noindex: true },
  '/checkout': { titulo: 'Datos de entrega', descripcion: 'Completa tus datos de entrega para enviar el pedido por WhatsApp.', noindex: true },
  '/pedido-confirmado': { titulo: 'Pedido listo', descripcion: 'Resumen de tu pedido en La Tienda de Pocho.', noindex: true },
};

export function metaCatalogo({ animal, q } = {}) {
  if (q) return { titulo: `Resultados para “${q}”`, descripcion: `Productos que coinciden con “${q}” en La Tienda de Pocho. Entregas en Bogotá.`, noindex: true };
  if (animal === 'gato') return { titulo: 'Alimento para gatos', descripcion: 'Alimento para gatos de varias marcas: gatitos, adultos, esterilizados y dietas veterinarias. Pide por WhatsApp, entregamos en Bogotá.' };
  if (animal === 'perro') return { titulo: 'Alimento para perros', descripcion: 'Alimento para perros: cachorros, adultos, razas pequeñas y dietas veterinarias. Pide por WhatsApp, entregamos en Bogotá.' };
  return META_ESTATICAS['/catalogo'];
}

export function metaMarca(marca) {
  const animales = [...marca.animales].map(para).join(' y ');
  return {
    titulo: `${marca.nombre}: alimento para ${animales}`,
    descripcion: `${marca.total} ${marca.total === 1 ? 'producto' : 'productos'} de ${marca.nombre} para ${animales} en La Tienda de Pocho. Pide por WhatsApp, entregamos en Bogotá.`,
    imagen: `/og/marca-${marca.slug}.jpg`,
  };
}

export function metaProducto(p) {
  const base = `${p.marca} ${p.nombre} (${p.presentacion}) para ${para(p.tipoAnimal)}.`;
  // La descripción genérica repetiría el nombre y la presentación: en ese caso se usa un cierre fijo.
  const detalle = p.descripcionGenerica || !p.descripcion ? 'Pídelo por WhatsApp, entregamos en Bogotá.' : p.descripcion;
  return {
    titulo: `${p.marca} ${p.nombre} ${p.presentacion}`,
    descripcion: recortar(`${base} ${detalle}`, 158),
    imagen: `/og/${p.id}.jpg`,
  };
}

export const tituloCompleto = (meta) => (meta.sinSufijo ? meta.titulo : `${meta.titulo} · ${NOMBRE_SITIO}`);
