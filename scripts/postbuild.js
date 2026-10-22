// Se ejecuta después de `vite build` (ver "build" en package.json). Trabaja sobre dist/:
//   1. Escribe un HTML por ruta (/, /catalogo, /marca/*, /producto/*, …) con su <title>, description,
//      canonical y Open Graph propios. La app sigue siendo una SPA: solo cambian las etiquetas del <head>,
//      que es lo que leen Facebook, WhatsApp y los buscadores sin ejecutar JavaScript.
//   2. Genera la imagen para compartir de cada producto y marca (dist/og/*.jpg, 1200×630).
//   3. Genera sitemap.xml y robots.txt con la URL pública del sitio.
//   4. Rendimiento: mete el CSS dentro del HTML (así no bloquea el primer pintado), precarga las
//      tipografías y, en la portada, la foto principal.
//
// URL pública, en este orden: TIENDA.url (src/config/store.ts) → SITE_URL →
// URL de Netlify (URL) → URL de producción de Vercel (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL).
// Requiere Node 22.18 o superior (lee store.ts directamente).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { TIENDA } from '../src/config/store.ts';
import {
  META_ESTATICAS, NOMBRE_SITIO, IMAGEN_OG_DEFECTO, metaMarca, metaProducto, tituloCompleto,
} from '../src/lib/seo.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const PUBLIC = path.join(RAIZ, 'public');

if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('No existe dist/index.html: corre primero `vite build`.');

// ── URL pública
function resolverUrl() {
  const e = process.env;
  const candidatos = [
    TIENDA.url, e.SITE_URL, e.URL,
    e.VERCEL_PROJECT_PRODUCTION_URL && `https://${e.VERCEL_PROJECT_PRODUCTION_URL}`,
    e.VERCEL_URL && `https://${e.VERCEL_URL}`,
  ].filter(Boolean);
  if (candidatos.length) return candidatos[0].replace(/\/+$/, '');
  console.warn('\n⚠ No se encontró la URL pública (TIENDA.url, SITE_URL, URL de Netlify o Vercel).');
  console.warn('  Se usa http://localhost:4173 solo para este build local. Antes de publicar, define SITE_URL.\n');
  return 'http://localhost:4173';
}
const SITIO = resolverUrl();

// ── Datos
const productos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'src', 'data', 'productos.json'), 'utf8')).map((p) => ({
  ...p,
  slugMarca: p.imagen.split('/')[2],
}));
const marcas = [...productos.reduce((m, p) => {
  const x = m.get(p.slugMarca) ?? { slug: p.slugMarca, nombre: p.marca, total: 0, animales: new Set(), primera: p };
  x.total++;
  x.animales.add(p.tipoAnimal);
  return m.set(p.slugMarca, x);
}, new Map()).values()];

// ── HTML por ruta
let plantilla = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

// CSS en línea: el HTML de entrada solo se descarga una vez por visita (la navegación es de la SPA).
plantilla = plantilla.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/, (_, href) => {
  const css = fs.readFileSync(path.join(DIST, href), 'utf8');
  return `<style>${css}</style>`;
});

// Precarga de las tipografías (solo el subconjunto latino, el que usa el español).
const fuentes = fs.readdirSync(path.join(DIST, 'assets')).filter((f) => /^(figtree|fraunces)-latin-wght-normal-.*\.woff2$/.test(f));
const precargaFuentes = fuentes.map((f) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${f}" />`).join('\n    ');
plantilla = plantilla.replace('</head>', `    ${precargaFuentes}\n  </head>`);

// Foto que más probablemente será el LCP de cada ruta: se precarga para que el navegador la pida
// sin esperar a que React pinte la página. Los `sizes` deben ser los mismos que usa el componente.
const SIZES_TARJETA = '(min-width: 1024px) 280px, (min-width: 768px) 30vw, 50vw'; // = ImagenProducto.jsx
const SIZES_HERO = '(min-width: 768px) 190px, 38vw'; // = SIZES_HERO de src/pages/Inicio.jsx
const SIZES_GALERIA = '(min-width: 768px) 540px, 92vw'; // = GaleriaProducto.jsx
const HERO_ID = 'nd-felino-tropical-adulto-1-5-kg'; // = IDS_HERO[1] de src/pages/Inicio.jsx
const ultimoDe = (lista) => lista[lista.length - 1]; // "novedades" ordena de último a primero

function linkImagen(p, sizes) {
  const base = p.imagen.replace(/.webp$/, '');
  const srcset = [240, 400, 800].map((w) => `${base}-${w}.webp ${w}w`).concat(`${base}.webp 1200w`).join(', ');
  return `<link rel="preload" as="image" href="${base}-400.webp" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high" />`;
}
function precargaImagen(ruta) {
  if (ruta === '/') return linkImagen(productos.find((p) => p.id === HERO_ID), SIZES_HERO);
  if (ruta === '/catalogo') return linkImagen(ultimoDe(productos), SIZES_TARJETA);
  if (ruta.startsWith('/marca/')) return linkImagen(ultimoDe(productos.filter((p) => p.slugMarca === ruta.split('/')[2])), SIZES_TARJETA);
  if (ruta.startsWith('/producto/')) return linkImagen(productos.find((p) => p.id === ruta.split('/')[2]), SIZES_GALERIA);
  return '';
}

// Código de cada página (manifiesto de Vite) para precargarlo y evitar la cascada HTML → JS → página → fotos.
const manifiesto = JSON.parse(fs.readFileSync(path.join(DIST, '.vite', 'manifest.json'), 'utf8'));
function chunksDe(clave, vistos = new Set()) {
  const entrada = manifiesto[clave];
  if (!entrada || vistos.has(clave)) return vistos;
  vistos.add(clave);
  for (const imp of entrada.imports ?? []) chunksDe(imp, vistos);
  return vistos;
}
const entradaPrincipal = Object.keys(manifiesto).find((k) => manifiesto[k].isEntry);
const yaCargados = new Set([...chunksDe(entradaPrincipal)].map((k) => manifiesto[k].file));
function paginaDeRuta(ruta) {
  if (ruta === '/') return 'Inicio';
  if (ruta.startsWith('/marca/')) return 'Marca';
  if (ruta.startsWith('/producto/')) return 'Producto';
  const mapa = { '/catalogo': 'Catalogo', '/carrito': 'Carrito', '/checkout': 'Checkout', '/pedido-confirmado': 'PedidoConfirmado', '/contacto': 'Contacto', '/nosotros': 'Nosotros', '/envios-y-devoluciones': 'Envios' };
  return mapa[ruta];
}
function precargaPagina(ruta) {
  const pagina = paginaDeRuta(ruta);
  const clave = pagina && `src/pages/${pagina}.jsx`;
  if (!clave || !manifiesto[clave]) return '';
  return [...chunksDe(clave)]
    .map((k) => manifiesto[k].file)
    .filter((f) => !yaCargados.has(f))
    .map((f) => `<link rel="modulepreload" crossorigin href="/${f}" />`)
    .join('\n    ');
}

const BLOQUE = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
if (!BLOQUE.test(plantilla)) throw new Error('index.html no tiene el bloque <!--seo:start--> … <!--seo:end-->.');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function etiquetas(ruta, meta, tipo = 'website') {
  const titulo = tituloCompleto(meta);
  const url = SITIO + (ruta === '/' ? '/' : ruta);
  const imagen = SITIO + (meta.imagen ?? IMAGEN_OG_DEFECTO);
  return [
    '<!--seo:start-->',
    `<title>${esc(titulo)}</title>`,
    `<meta name="description" content="${esc(meta.descripcion)}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${tipo}" />`,
    `<meta property="og:site_name" content="${esc(NOMBRE_SITIO)}" />`,
    '<meta property="og:locale" content="es_CO" />',
    `<meta property="og:title" content="${esc(titulo)}" />`,
    `<meta property="og:description" content="${esc(meta.descripcion)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(imagen)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(titulo)}" />`,
    `<meta name="twitter:description" content="${esc(meta.descripcion)}" />`,
    `<meta name="twitter:image" content="${esc(imagen)}" />`,
    '<!--seo:end-->',
  ].join('\n    ');
}

function escribirRuta(ruta, meta, tipo) {
  let html = plantilla.replace(BLOQUE, () => etiquetas(ruta, meta, tipo));
  const precarga = precargaPagina(ruta);
  if (precarga) html = html.replace('</head>', `    ${precarga}
  </head>`);
  const imagen = precargaImagen(ruta);
  if (imagen) html = html.replace('</head>', `    ${imagen}
  </head>`);
  const destino = ruta === '/' ? path.join(DIST, 'index.html') : path.join(DIST, ...ruta.split('/').filter(Boolean), 'index.html');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html, 'utf8');
}

// ── Imagen para compartir: foto del producto sobre fondo crema, 1200×630
async function imagenOg(producto, destino) {
  const origen = path.join(PUBLIC, producto.imagen.replace(/^\//, ''));
  const foto = await sharp(origen).resize({ width: 520, height: 560, fit: 'inside' }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f1e3cc' } })
    .composite([{ input: foto, gravity: 'center' }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(destino);
}

fs.mkdirSync(path.join(DIST, 'og'), { recursive: true });
const rutas = [];

// Rutas fijas (todas, incluidas las noindex: así también tienen su <head> correcto)
for (const [ruta, meta] of Object.entries(META_ESTATICAS)) {
  escribirRuta(ruta, meta);
  if (!meta.noindex) rutas.push({ ruta, prioridad: ruta === '/' ? '1.0' : ruta === '/catalogo' ? '0.9' : '0.5' });
}

for (const m of marcas) {
  await imagenOg(m.primera, path.join(DIST, 'og', `marca-${m.slug}.jpg`));
  escribirRuta(`/marca/${m.slug}`, metaMarca(m));
  rutas.push({ ruta: `/marca/${m.slug}`, prioridad: '0.7' });
}

for (const p of productos) {
  await imagenOg(p, path.join(DIST, 'og', `${p.id}.jpg`));
  escribirRuta(`/producto/${p.id}`, metaProducto(p), 'product');
  rutas.push({ ruta: `/producto/${p.id}`, prioridad: '0.6' });
}

// ── sitemap.xml y robots.txt
const hoy = new Date().toISOString().slice(0, 10);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...rutas.map((r) => `  <url><loc>${esc(SITIO + (r.ruta === '/' ? '/' : r.ruta))}</loc><lastmod>${hoy}</lastmod><priority>${r.prioridad}</priority></url>`),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');

const noindex = Object.entries(META_ESTATICAS).filter(([, m]) => m.noindex).map(([r]) => `Disallow: ${r}`);
fs.writeFileSync(
  path.join(DIST, 'robots.txt'),
  ['User-agent: *', 'Allow: /', ...noindex, '', `Sitemap: ${SITIO}/sitemap.xml`, ''].join('\n'),
  'utf8',
);

fs.rmSync(path.join(DIST, '.vite'), { recursive: true, force: true }); // el manifiesto ya no hace falta

console.log(`postbuild: ${rutas.length} URLs en sitemap · ${productos.length + marcas.length} imágenes OG · sitio: ${SITIO}`);
