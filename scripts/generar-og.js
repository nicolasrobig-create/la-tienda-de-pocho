// Genera, a partir del logo y de las fotos de public/ (primero corre `npm run fotos`):
//   public/og-default.jpg (1200×630, imagen al compartir el sitio en Facebook/WhatsApp)
//   public/favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png (cara del gato sobre azul de marca)
// Se corre a mano (npm run og) cuando cambie el logo o las fotos; los resultados se guardan en public/.
// El texto usa fuentes del sistema (Arial): correrlo en la computadora, no en el servidor de build.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(RAIZ, 'public');
const AZUL = '#0b4390';
const NOCHE = '#0a2a63';
const FONDO = '#fffaf0';

// Íconos: la cara del gato centrada sobre el azul de marca, con margen para que no la corten las máscaras
const gato = await sharp(path.join(PUBLIC, 'marca-gato.png')).toBuffer();
for (const [archivo, lado] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const interior = Math.round(lado * 0.78);
  const cara = await sharp(gato).resize({ width: interior, height: interior, fit: 'inside', kernel: 'lanczos3' }).toBuffer();
  await sharp({ create: { width: lado, height: lado, channels: 3, background: AZUL } })
    .composite([{ input: cara, gravity: 'centre' }])
    .png()
    .toFile(path.join(PUBLIC, archivo));
}

// Imagen para compartir: degradado de marca, logo, mensaje y dos fotos reales
const marco = async (archivo, ancho, alto, angulo) => {
  const foto = await sharp(path.join(PUBLIC, 'fotos', archivo))
    .resize(ancho, alto, { fit: 'cover' })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: FONDO })
    .png()
    .toBuffer();
  return sharp(foto).rotate(angulo, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
};
const [perro, gata] = await Promise.all([
  marco('perro-pasto-480.webp', 270, 380, 4),
  marco('gata-churu-480.webp', 250, 360, -5),
]);
const logo = await sharp(path.join(PUBLIC, 'logo-2x.webp'))
  .resize({ width: 560 })
  .composite([{ input: Buffer.from('<svg width="560" height="244"><rect width="560" height="244" rx="32"/></svg>'), blend: 'dest-in' }])
  .png()
  .toBuffer();

const fondo = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${AZUL}"/><stop offset="1" stop-color="${NOCHE}"/></linearGradient>
    <radialGradient id="h" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="#ffb020" stop-opacity="0.14"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#h)"/>
  <text x="72" y="445" font-family="Arial, sans-serif" font-weight="700" font-size="40" fill="${FONDO}">Alimento para gatos y perros</text>
  <rect x="72" y="480" width="330" height="52" rx="26" fill="#ffb020"/>
  <text x="97" y="516" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="${NOCHE}">Entregas en Bogotá</text>
</svg>`);

await sharp(fondo)
  .composite([
    { input: logo, left: 56, top: 130 },
    { input: gata, left: 690, top: 80 },
    { input: perro, left: 880, top: 170 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(PUBLIC, 'og-default.jpg'));

console.log('Generados: og-default.jpg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png');
