// Genera src/data/productos.json y las imágenes WebP a partir de la carpeta Productos/.
//
// Uso:
//   node scripts/generar-catalogo.js                 -> todas las marcas
//   node scripts/generar-catalogo.js --marca FELIX   -> solo una marca (prueba)
//   node scripts/generar-catalogo.js --sin-imagenes  -> solo datos, sin tocar imágenes
//
// No concatena comandos de shell: todo es fs + path.join + sharp + mammoth.
// Los precios NO se generan acá (ver precios.json / scripts/generar-precios.js).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import mammoth from 'mammoth';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_PRODUCTOS = path.join(RAIZ, 'Productos');
const DIR_IMAGENES = path.join(RAIZ, 'public', 'productos');
const ARCHIVO_CATALOGO = path.join(RAIZ, 'src', 'data', 'productos.json');
const ARCHIVO_REPORTE = path.join(RAIZ, 'docs', 'reporte-catalogo.json');

const ANCHO_MAX = 1200;
const CALIDAD_WEBP = 80;
// Versiones chicas para las tarjetas (srcset): <id>-240.webp, -400.webp y -800.webp junto a <id>.webp (1200 px).
const ANCHOS_EXTRA = [240, 400, 800];
const rutaVariante = (destino, ancho) => destino.replace(/\.webp$/, `-${ancho}.webp`);

// ───────────────────────── Configuración editable ─────────────────────────

// Carpeta de animal -> tipoAnimal. "F C" se asume felino (confirmado: todo es alimento de gatos),
// "C C" es canino (solo HILLS).
const TIPO_POR_CARPETA = { 'F C': 'felino', 'C C': 'canino' };

// Carpetas sueltas que no siguen la estructura Marca/[F C|C C]/foto.
// HOLLIDAY/Nueva carpeta: la bolsa dice "Dieta prescripta para gatos" -> felino.
const CARPETAS_SUELTAS = { 'HOLLIDAY/Nueva carpeta': 'felino' };

// Nombre comercial de cada marca (la carpeta es la fuente del slug).
const MARCAS = {
  'AGILITY GOLD': 'Agility Gold',
  'BR': 'BR',
  'CAT CHAOW': 'Cat Chow',
  'COUNTRY VALUE': 'Country Value',
  'DIAMOND NATURALS': 'Diamond Naturals',
  'EQUILIBRIO': 'Equilibrio',
  'EVOLVE': 'Evolve',
  'EXCELLENT': 'Excellent',
  'FELIX': 'Felix',
  'HILLS': "Hill's",
  'HOLLIDAY': 'Holliday',
  'MAX': 'Max',
  'MONELLO': 'Monello',
  'MONGE': 'Monge',
  'N&D': 'N&D',
  'NULO': 'Nulo',
  'NUPEC': 'Nupec',
  'NUTRA-NUGGETS': 'Nutra-Nuggets',
  'ORIJEN': 'Orijen',
  'PRO PLAN': 'Pro Plan',
  'SIETE VIDAS': 'Siete Vidas',
  'TASTE OF THE WILD': 'Taste of the Wild',
  'VETLIFE': 'VetLife',
  'VIRBAC': 'Virbac',
};
const SLUG_MARCA = { 'N&D': 'nd' };

// Errores de tipeo en los nombres de archivo (clave: nombre en mayúsculas tal cual aparece).
const CORRECCIONES_NOMBRE = {
  'KINDEY & JOINT': 'KIDNEY & JOINT',
};

// Unidad mal escrita en el nombre de archivo, verificada contra la bolsa. Clave: 'CARPETA|NOMBRE|CANTIDAD'.
// Evolve Classic Salmón: la bolsa dice 2,75 lbs / 1,24 KG (el archivo decía LB).
const UNIDAD_CORREGIDA = {
  'EVOLVE|CLASSIC SALMON|1.24': 'KG',
};

// Nombre visible cuando el nombre de archivo es una sigla o código. Clave: "MARCA|NOMBRE".
const NOMBRES_VISIBLES = {
  'HILLS|I D': 'Prescription Diet i/d',
  'HILLS|I D LOW FAT': 'Prescription Diet i/d Low Fat',
  'HILLS|R D': 'Prescription Diet r/d',
  'HILLS|W D': 'Prescription Diet w/d',
  'HILLS|Z D': 'Prescription Diet z/d',
  'HILLS|METABOLIC': 'Prescription Diet Metabolic',
  'PRO PLAN|EN': 'Veterinary Diets EN Gastroenteric',
  'PRO PLAN|HA': 'Veterinary Diets HA Hypoallergenic',
  'PRO PLAN|OM': 'Veterinary Diets OM Overweight Management',
  'PRO PLAN|UR': 'Veterinary Diets UR Urinary',
  'PRO PLAN|NF EARLY CARE': 'Veterinary Diets NF Early Care',
  'PRO PLAN|NF RENAL FUNCTION': 'Veterinary Diets NF Renal Function',
  'PRO PLAN|LIVECLEAR': 'LiveClear',
  'HOLLIDAY|GASTROINTESTINAL': 'MV Dieta Prescripta Gastrointestinal',
  'EQUILIBRIO|PELOS LONGOS': 'Pelos Largos',
  'BR|BOLA DE PELO ADULTO': 'Bola de Pelo Adulto',
  'MONGE|VETSOLUTION RENAL': 'VetSolution Renal',
  'VIRBAC|ADULT WITH SALMON NEUTERED & ENTIRE': 'Adult with Salmon Neutered & Entire',
};

// Palabras que deben quedar en mayúscula o con forma propia al pasar a "Título".
const PALABRAS_ESPECIALES = {
  SALMON: 'Salmón', HOGAREÑOS: 'Hogareños', 'N&D': 'N&D', EN: 'EN', HA: 'HA', OM: 'OM', UR: 'UR', NF: 'NF',
  Y: 'y', DE: 'de', DEL: 'del', LA: 'la', LAS: 'las', LOS: 'los', EL: 'el', CON: 'con', 'GRAIN-FREE': 'Grain-Free', 'GASTRO-INTESTINAL': 'Gastro-Intestinal',
};

// Líneas veterinarias / dietas de prescripción (etiqueta "dieta veterinaria").
const MARCAS_VETERINARIAS = new Set(['HOLLIDAY', 'VETLIFE', 'MONGE', 'VIRBAC']);
const VETERINARIAS_POR_MARCA = {
  HILLS: ['I D', 'I D LOW FAT', 'R D', 'W D', 'Z D', 'METABOLIC'],
  'PRO PLAN': ['EN', 'HA', 'OM', 'UR', 'NF EARLY CARE', 'NF RENAL FUNCTION'],
};
const MARCAS_PREMIUM = new Set(['ORIJEN', 'TASTE OF THE WILD', 'N&D', 'NULO', 'DIAMOND NATURALS', 'EVOLVE', 'HILLS']);

// Qué sección del .docx describe a cada producto. Clave: marca -> { NOMBRE_EN_ARCHIVO: nº de sección (desde 1) }.
// Un mismo producto en varias presentaciones comparte descripción.
const SECCIONES_DOCX = {
  'COUNTRY VALUE': { 'POLLO Y PESCADO': 1 },
  EVOLVE: { 'CLASSIC POLLO': 1, 'CLASSIC SALMON': 2, 'GRAIN-FREE PESCADO': 3, KITTEN: 4 },
  EXCELLENT: { ADULTO: 1, KITTEN: 2, URINARY: 3 },
  FELIX: { 'TRIPLE DELICIOUS': 1 },
  'N&D': {
    'ANCESTRAL GRAIN': 1, 'ANCESTRAL KITTEN': 2, 'OCEAN CASTRADOS': 3, 'PRIME ADULTO': 4,
    'TROPICAL ADULTO': 5, 'TROPICAL CASTRADOS': 6, URINARY: 7,
  },
  NULO: { HAIRBALL: 1, 'INDOOR CAT': 2, KITTEN: 3 },
  'NUTRA-NUGGETS': { AMARILLO: 1 },
  'PRO PLAN': {
    ADULTO: 1, EN: 2, HA: 3, LIVECLEAR: 4, 'NF EARLY CARE': 5, 'NF RENAL FUNCTION': 6,
    OM: 7, STERILIZED: 8, UR: 9, URINARY: 10,
  },
  'TASTE OF THE WILD': { 'CANYON RIVER': 1, 'LOWLAND CREEK': 2, 'ROCKY MOUNTAIN': 3 },
};

// ───────────────────────────── Utilidades ─────────────────────────────

const args = process.argv.slice(2);
const idxMarca = args.indexOf('--marca');
const SOLO_MARCA = idxMarca >= 0 ? args[idxMarca + 1] : null;
const SIN_IMAGENES = args.includes('--sin-imagenes');

const reporte = {
  fecha: new Date().toISOString(),
  marcas: {},
  fotos: { procesadas: 0, omitidasPorExistir: 0, fallidas: [] },
  docx: { leidos: [], vacios: [], conError: [], sinMapeo: [] },
  sinFoto: [],
  sinDescripcion: [],
  advertencias: [],
};

const slug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const limpiarEspacios = (t) => t.replace(/\s+/g, ' ').trim();

const quitarEmojis = (t) =>
  limpiarEspacios(t.replace(/[\p{Extended_Pictographic}️‍⃣]/gu, ''))
    .replace(/\s+([:,.;])/g, '$1');

function listar(dir) {
  return fs.readdirSync(dir, { withFileTypes: true });
}

// "1.5 KG" -> { texto: "1,5 kg", kg: 1.5 }
function normalizarPresentacion(cantidad, unidad) {
  const n = parseFloat(cantidad.replace(',', '.'));
  const u = unidad.toUpperCase();
  const num = String(n).replace('.', ',');
  if (u === 'KG') return { texto: `${num} kg`, kg: n };
  if (u === 'GM') return { texto: `${num} g`, kg: n / 1000 };
  return { texto: `${num} lb`, kg: Math.round(n * 0.45 * 1000) / 1000 };
}

// "ADULTO 1-6 4 LB .jpeg" -> { nombre: "ADULTO 1-6", cantidad: "4", unidad: "LB" }
function parsearArchivo(archivo) {
  const base = limpiarEspacios(path.parse(archivo).name);
  const m = base.match(/^(.+?)\s*\b(\d+(?:[.,]\d+)?)\s*(KG|GM|LB)$/i);
  if (!m) return null;
  return { nombre: limpiarEspacios(m[1]).toUpperCase(), cantidad: m[2], unidad: m[3] };
}

function nombreVisible(marcaCarpeta, nombreRaw) {
  const clave = `${marcaCarpeta}|${nombreRaw}`;
  if (NOMBRES_VISIBLES[clave]) return NOMBRES_VISIBLES[clave];
  return nombreRaw
    .split(' ')
    .map((p, i) => {
      if (PALABRAS_ESPECIALES[p]) return i === 0 ? PALABRAS_ESPECIALES[p].replace(/^./, (c) => c.toUpperCase()) : PALABRAS_ESPECIALES[p];
      if (/^[\d+\-.,]+$/.test(p) || p === '&') return p;
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function esVeterinario(marcaCarpeta, nombreRaw) {
  if (MARCAS_VETERINARIAS.has(marcaCarpeta)) return true;
  return (VETERINARIAS_POR_MARCA[marcaCarpeta] || []).includes(nombreRaw);
}

function generarEtiquetas({ marcaCarpeta, tipoAnimal, nombreRaw }) {
  const t = new Set();
  const n = ` ${nombreRaw} `;
  t.add(tipoAnimal === 'felino' ? 'gatos' : 'perros');
  const tiene = (...ks) => ks.some((k) => n.includes(k));

  if (tiene(' KITTEN ')) t.add('gatito');
  if (tiene(' PUPPY ')) t.add('cachorro');
  if (tiene(' ADULTO ', ' ADULT ')) t.add('adulto');
  if (tiene(' 7+ ', ' 11+ ', ' MAYOR ', ' SENIOR ')) t.add('senior');
  if (tiene('CASTRAD', 'ESTERILIZAD', 'STERILIZED', 'NEUTERED')) t.add('esterilizado');
  if (tiene('URINARY', ' UR ', 'STRUVITE')) t.add('cuidado urinario');
  if (tiene('RENAL', 'KIDNEY')) t.add('cuidado renal');
  if (tiene('HAIRBALL', 'BOLA DE PELO', 'PELOS LONGOS')) t.add('bolas de pelo');
  if (tiene('LIGHT', 'WEIGHT', ' OM ', 'METABOLIC', ' W D ', ' R D ', 'FIT & TRIM')) t.add('control de peso');
  if (tiene('GASTRO', ' EN ', 'DIGESTIVE', 'SENSITIVE STOMACH', ' I D ')) t.add('salud digestiva');
  if (tiene('DIABETIC')) t.add('diabetes');
  if (tiene(' HA ', ' Z D ', 'LIVECLEAR')) t.add('alergias');
  if (tiene('INDOOR', 'HOGAREÑOS')) t.add('gatos de interior');
  if (tiene('GRAIN-FREE', 'GRAIN FREE')) t.add('sin granos');
  if (tiene('POLLO')) t.add('pollo');
  if (tiene('SALMON')) t.add('salmón');
  if (tiene('PESCADO', 'SABORES DE MAR', 'SABORES DEL MAR', 'OCEAN', 'SIX FISH')) t.add('pescado');
  if (tiene('CARNE')) t.add('carne');
  if (tiene('CORDERO')) t.add('cordero');

  if (esVeterinario(marcaCarpeta, nombreRaw)) t.add('dieta veterinaria');
  else if (MARCAS_PREMIUM.has(marcaCarpeta)) t.add('premium');
  return [...t];
}

// Texto genérico para productos sin descripción real. No inventa datos del producto:
// solo usa marca, tipo de animal, nombre y presentación.
function descripcionGenerica({ marca, tipoAnimal, nombre, presentacion, veterinario }) {
  const para = tipoAnimal === 'felino' ? 'gatos' : 'perros';
  const tu = tipoAnimal === 'felino' ? 'tu gato' : 'tu perro';
  if (veterinario) {
    return `${nombre} de ${marca}, dieta veterinaria para ${para} en bolsa de ${presentacion}. Úsala bajo supervisión veterinaria; si tienes dudas, escríbenos y te ayudamos.`;
  }
  return `${nombre} de ${marca}, alimento seco para ${para} en bolsa de ${presentacion}. Una opción para la comida diaria de ${tu}. Si no sabes cuál elegir, escríbenos y te ayudamos.`;
}

// ───────────────────────────── Lectura de .docx ─────────────────────────────

const ES_TITULO_SECCION = (l) => l.startsWith('\u{1F431}'); // 🐱
const ES_ENCABEZADO = (l) => /^[\u{1F4CC}\u{1F4CA}\u{1F9EC}\u{1F43E}⚖\u{1F31F}\u{1F49A}⚠⭐]/u.test(l);

// Devuelve las secciones del documento: [{ titular, descripcion, ingredientes[], beneficios[] }]
function parsearSecciones(texto) {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bloques = [];
  for (const l of lineas) {
    if (ES_TITULO_SECCION(l)) bloques.push([l]);
    else if (bloques.length) bloques[bloques.length - 1].push(l);
  }
  return bloques.map((b) => {
    const titular = quitarEmojis(b[0]);
    const cuerpo = b.slice(1);
    const descripcion = quitarEmojis(cuerpo.find((l) => l.length > 80 && !l.includes('✔')) || '');

    const ingredientes = [];
    const iIng = cuerpo.findIndex((l) => /Ingredientes principales|Caracter[ií]sticas principales/i.test(l));
    if (iIng >= 0) {
      for (const l of cuerpo.slice(iIng + 1)) {
        if (ES_ENCABEZADO(l)) break;
        ingredientes.push(quitarEmojis(l));
      }
    }

    let beneficios = [];
    const iPorQue = cuerpo.findIndex((l) => /Por qu[eé] elegirlo/i.test(l));
    if (iPorQue >= 0 && cuerpo[iPorQue + 1]) {
      beneficios = cuerpo[iPorQue + 1].split('✔').map(quitarEmojis).filter(Boolean);
    } else {
      const iBen = cuerpo.findIndex((l) => /^\u{1F43E}\s*Beneficios/u.test(l));
      if (iBen >= 0) {
        for (const l of cuerpo.slice(iBen + 1)) {
          if (ES_ENCABEZADO(l)) break;
          beneficios.push(quitarEmojis(l));
        }
      }
    }
    return { titular, descripcion, ingredientes, beneficios };
  });
}

async function leerDocx(rutaDocx, etiqueta) {
  const tam = fs.statSync(rutaDocx).size;
  if (tam === 0) {
    reporte.docx.vacios.push(etiqueta);
    return null;
  }
  try {
    const { value } = await mammoth.extractRawText({ path: rutaDocx });
    const secciones = parsearSecciones(value);
    reporte.docx.leidos.push({ archivo: etiqueta, secciones: secciones.length });
    return secciones;
  } catch (e) {
    reporte.docx.conError.push({ archivo: etiqueta, error: e.message });
    return null;
  }
}

// ───────────────────────────── Imágenes ─────────────────────────────

async function procesarImagen(origen, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const todas = [destino, ...ANCHOS_EXTRA.map((a) => rutaVariante(destino, a))];
  const mtimeOrigen = fs.statSync(origen).mtimeMs;
  if (todas.every((r) => fs.existsSync(r) && fs.statSync(r).mtimeMs >= mtimeOrigen)) {
    reporte.fotos.omitidasPorExistir++;
    return true;
  }
  try {
    const base = sharp(origen).rotate(); // respeta la orientación EXIF de las fotos de celular
    await base.clone().resize({ width: ANCHO_MAX, withoutEnlargement: true }).webp({ quality: CALIDAD_WEBP }).toFile(destino);
    for (const ancho of ANCHOS_EXTRA) {
      await base.clone().resize({ width: ancho, withoutEnlargement: true }).webp({ quality: CALIDAD_WEBP - 2 }).toFile(rutaVariante(destino, ancho));
    }
    reporte.fotos.procesadas++;
    return true;
  } catch (e) {
    reporte.fotos.fallidas.push({ archivo: path.relative(RAIZ, origen), error: e.message });
    return false;
  }
}

// ───────────────────────────── Recorrido de carpetas ─────────────────────────────

// Devuelve [{ carpetaAnimal (ruta), tipoAnimal }] para una marca.
function carpetasDeMarca(marcaCarpeta) {
  const dirMarca = path.join(DIR_PRODUCTOS, marcaCarpeta);
  const res = [];
  for (const e of listar(dirMarca)) {
    if (!e.isDirectory()) continue;
    const clave = `${marcaCarpeta}/${e.name}`;
    if (TIPO_POR_CARPETA[e.name]) res.push({ dir: path.join(dirMarca, e.name), tipoAnimal: TIPO_POR_CARPETA[e.name] });
    else if (CARPETAS_SUELTAS[clave]) res.push({ dir: path.join(dirMarca, e.name), tipoAnimal: CARPETAS_SUELTAS[clave] });
    else reporte.advertencias.push(`Carpeta no reconocida ignorada: ${clave}`);
  }
  return res;
}

async function procesarMarca(marcaCarpeta) {
  const marca = MARCAS[marcaCarpeta] || marcaCarpeta;
  const slugMarca = SLUG_MARCA[marcaCarpeta] || slug(marcaCarpeta);
  const productos = [];
  const resumen = { fotos: 0, productos: 0, docx: [] };

  // 1) Descripciones: cualquier .docx dentro de la marca (también el suelto de NULO).
  let secciones = null;
  for (const { dir } of carpetasDeMarca(marcaCarpeta).concat([{ dir: path.join(DIR_PRODUCTOS, marcaCarpeta) }])) {
    for (const e of listar(dir)) {
      if (e.isFile() && path.extname(e.name).toLowerCase() === '.docx') {
        const etiqueta = path.relative(DIR_PRODUCTOS, path.join(dir, e.name));
        resumen.docx.push(etiqueta);
        secciones = (await leerDocx(path.join(dir, e.name), etiqueta)) || secciones;
      }
    }
  }
  const mapa = SECCIONES_DOCX[marcaCarpeta];
  if (secciones && !mapa) reporte.docx.sinMapeo.push(marcaCarpeta);

  // 2) Fotos -> productos
  for (const { dir, tipoAnimal } of carpetasDeMarca(marcaCarpeta)) {
    for (const e of listar(dir)) {
      if (!e.isFile() || !/\.(jpe?g|png|webp)$/i.test(e.name)) continue;
      resumen.fotos++;
      const parsed = parsearArchivo(e.name);
      if (!parsed) {
        reporte.advertencias.push(`No se pudo interpretar el nombre: ${marcaCarpeta}/${e.name}`);
        continue;
      }
      const nombreRaw = CORRECCIONES_NOMBRE[parsed.nombre] || parsed.nombre;
      const unidad = UNIDAD_CORREGIDA[`${marcaCarpeta}|${nombreRaw}|${parsed.cantidad}`] || parsed.unidad;
      const pres = normalizarPresentacion(parsed.cantidad, unidad);
      const id = slug(`${slugMarca} ${tipoAnimal} ${nombreRaw} ${pres.texto}`.replace(/,/g, '.'));
      const rutaImagen = path.join(DIR_IMAGENES, slugMarca, `${id}.webp`);
      const ok = SIN_IMAGENES ? fs.existsSync(rutaImagen) : await procesarImagen(path.join(dir, e.name), rutaImagen);

      let desc = { descripcion: null, ingredientes: [], beneficios: [] };
      if (secciones && mapa && mapa[nombreRaw] && secciones[mapa[nombreRaw] - 1]) {
        const s = secciones[mapa[nombreRaw] - 1];
        desc = { descripcion: s.descripcion || null, ingredientes: s.ingredientes, beneficios: s.beneficios };
      }
      const nombreMostrar = nombreVisible(marcaCarpeta, nombreRaw);
      let esGenerica = false;
      if (!desc.descripcion) {
        desc.descripcion = descripcionGenerica({ marca, tipoAnimal, nombre: nombreMostrar, presentacion: pres.texto, veterinario: esVeterinario(marcaCarpeta, nombreRaw) });
        esGenerica = true;
        reporte.sinDescripcion.push(id);
      }
      if (!ok) reporte.sinFoto.push(id);

      productos.push({
        id,
        marca,
        tipoAnimal,
        nombre: nombreMostrar,
        presentacion: pres.texto,
        pesoKg: pres.kg,
        imagen: ok ? `/productos/${slugMarca}/${id}.webp` : null,
        descripcion: desc.descripcion,
        descripcionGenerica: esGenerica,
        ingredientes: desc.ingredientes,
        beneficios: desc.beneficios,
        etiquetas: generarEtiquetas({ marcaCarpeta, tipoAnimal, nombreRaw }),
      });
    }
  }
  resumen.productos = productos.length;
  reporte.marcas[marcaCarpeta] = resumen;
  return productos;
}

async function main() {
  const marcas = listar(DIR_PRODUCTOS)
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((m) => !SOLO_MARCA || m === SOLO_MARCA)
    .sort((a, b) => a.localeCompare(b, 'es'));
  if (!marcas.length) throw new Error(`No hay marcas para procesar (--marca ${SOLO_MARCA})`);

  const catalogo = [];
  for (const m of marcas) catalogo.push(...(await procesarMarca(m)));

  const ids = new Set();
  for (const p of catalogo) {
    if (ids.has(p.id)) reporte.advertencias.push(`ID duplicado: ${p.id}`);
    ids.add(p.id);
  }

  fs.mkdirSync(path.dirname(ARCHIVO_CATALOGO), { recursive: true });
  fs.writeFileSync(ARCHIVO_CATALOGO, JSON.stringify(catalogo, null, 2) + '\n', 'utf8');
  fs.mkdirSync(path.dirname(ARCHIVO_REPORTE), { recursive: true });
  fs.writeFileSync(ARCHIVO_REPORTE, JSON.stringify(reporte, null, 2) + '\n', 'utf8');

  console.log(`Marcas: ${marcas.length} | Productos: ${catalogo.length}`);
  console.log(`Fotos procesadas: ${reporte.fotos.procesadas} (ya existentes: ${reporte.fotos.omitidasPorExistir}, fallidas: ${reporte.fotos.fallidas.length})`);
  console.log(`.docx leídos: ${reporte.docx.leidos.length} | vacíos: ${reporte.docx.vacios.length} | con error: ${reporte.docx.conError.length}`);
  console.log(`Sin descripción: ${reporte.sinDescripcion.length} | Advertencias: ${reporte.advertencias.length}`);
  console.log(`Reporte: ${path.relative(RAIZ, ARCHIVO_REPORTE)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
