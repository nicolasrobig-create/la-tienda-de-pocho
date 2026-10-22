// Genera, a partir de public/favicon.svg y de algunas fotos del catálogo:
//   public/og-default.jpg (1200×630, imagen al compartir el sitio en Facebook/WhatsApp)
//   public/favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
// Se corre a mano (npm run og) cuando cambie el logo; los archivos resultantes se guardan en public/.
// El texto usa fuentes del sistema (Georgia/Arial): correrlo en la computadora, no en el servidor de build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(RAIZ, 'public');
const svg = fs.readFileSync(path.join(PUBLIC, 'favicon.svg'));

// Íconos
for (const [archivo, lado] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(svg, { density: 384 }).resize(lado, lado).png().toFile(path.join(PUBLIC, archivo));
}

// Imagen para compartir
const FOTOS = [
  ['orijen', 'orijen-felino-original-cat-4-lb', -6],
  ['nd', 'nd-felino-tropical-adulto-1-5-kg', 3],
  ['hills', 'hills-felino-adulto-indoor-3-5-lb', 7],
];
const tarjetas = [];
for (const [marca, id, angulo] of FOTOS) {
  const foto = await sharp(path.join(PUBLIC, 'productos', marca, `${id}-400.webp`))
    .resize(250, 330, { fit: 'cover' })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' })
    .png()
    .toBuffer();
  tarjetas.push(await sharp(foto).rotate(angulo, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
}

const texto = Buffer.from(`
<svg width="700" height="630" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(70 120) scale(1.7)">${svg.toString().replace(/<\/?svg[^>]*>/g, '')}</g>
  <text x="70" y="330" font-family="Georgia, serif" font-weight="700" font-size="74" fill="#3b2418">La Tienda</text>
  <text x="70" y="410" font-family="Georgia, serif" font-weight="700" font-size="74" fill="#b5452f">de Pocho</text>
  <text x="72" y="475" font-family="Arial, sans-serif" font-size="32" fill="#6b5648">Alimento para gatos y perros</text>
  <text x="72" y="520" font-family="Arial, sans-serif" font-size="32" fill="#6b5648">Entregas en Bogotá</text>
</svg>`);

await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f1e3cc' } })
  .composite([
    { input: texto, left: 0, top: 0 },
    { input: tarjetas[0], left: 640, top: 180 },
    { input: tarjetas[1], left: 760, top: 40 },
    { input: tarjetas[2], left: 880, top: 220 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(PUBLIC, 'og-default.jpg'));

console.log('Generados: og-default.jpg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png');
