// Prepara las fotos reales de la tienda (carpeta Fotos/, que no se despliega) para la web:
//   public/fotos/<nombre>-<ancho>.webp   variantes de 360/480/768/1080 px, sin ampliar nunca el original
//   src/data/fotos.json                  anchos disponibles y proporción de cada foto
//   public/logo.webp, public/logo-2x.webp   wordmark recortado del logo
//   public/marca-gato.png                cara del gato (base de favicon, iconos y og-default.jpg)
// Los recortes quitan stickers, emojis, marcas de agua y rótulos ajenos. Se corre a mano: npm run fotos

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(RAIZ, 'public');
const SALIDA = path.join(PUBLIC, 'fotos');
const ANCHOS = [360, 480, 768, 1080];

// Recortes en píxeles del original: { left, top, width, height }
const FOTOS = [
  { nombre: 'perro-pasto', origen: 'Imagenes/480111060_1159507789206078_7932989560049892676_n.jpg', recorte: { left: 0, top: 0, width: 550, height: 815 } },
  { nombre: 'gata-churu', origen: 'Imagenes/479908977_1159508075872716_2427410416028754895_n.jpg', recorte: { left: 0, top: 0, width: 790, height: 1271 } },
  { nombre: 'terranova-tienda', origen: 'Imagenes/479433006_1157893836034140_9139124655917692202_n.jpg' },
  { nombre: 'bodega-pared', origen: 'Bodega/476798801_1156082862881904_4454124409877991374_n.jpg', recorte: { left: 0, top: 90, width: 1080, height: 600 } },
  { nombre: 'bodega-proplan', origen: 'Bodega/473175363_1136155921541265_1715191662776360754_n.jpg' },
  { nombre: 'local-interior', origen: 'Bodega/477020985_1157893706034153_245382295497722114_n.jpg', recorte: { left: 0, top: 330, width: 1080, height: 500 } },
  { nombre: 'perro-negro', origen: 'Imagenes/477012542_1157885989368258_4818509399246880510_n.jpg', recorte: { left: 0, top: 0, width: 420, height: 730 } },
];

const LOGO = 'Logo/473316455_1136155054874685_4149034848367092619_n.jpg';

fs.mkdirSync(SALIDA, { recursive: true });
const manifiesto = {};

for (const f of FOTOS) {
  let base = sharp(path.join(RAIZ, 'Fotos', f.origen));
  if (f.recorte) base = base.extract(f.recorte);
  const recortada = await base.toBuffer();
  const { width, height } = await sharp(recortada).metadata();
  const anchos = ANCHOS.filter((a) => a < width);
  if (!anchos.includes(width) && width <= ANCHOS.at(-1)) anchos.push(width);
  for (const ancho of anchos) {
    await sharp(recortada).resize({ width: ancho }).webp({ quality: 70, effort: 6 }).toFile(path.join(SALIDA, `${f.nombre}-${ancho}.webp`));
  }
  manifiesto[f.nombre] = { anchos, ancho: width, alto: height };
  console.log(`${f.nombre}: ${width}×${height} → ${anchos.join(', ')}`);
}

fs.writeFileSync(path.join(RAIZ, 'src', 'data', 'fotos.json'), JSON.stringify(manifiesto, null, 2) + '\n');

// Logo: el wordmark ocupa la franja central; el fondo azul coincide con el del header.
const logo = sharp(path.join(RAIZ, 'Fotos', LOGO));
const wordmark = await logo.clone().extract({ left: 0, top: 180, width: 540, height: 235 }).toBuffer();
await sharp(wordmark).webp({ quality: 90 }).toFile(path.join(PUBLIC, 'logo-2x.webp'));
await sharp(wordmark).resize({ width: 270 }).webp({ quality: 90 }).toFile(path.join(PUBLIC, 'logo.webp'));

// Cara del gato para iconos
await logo.clone().extract({ left: 410, top: 224, width: 130, height: 186 })
  .png().toFile(path.join(PUBLIC, 'marca-gato.png'));
console.log('logo y marca-gato listos');
