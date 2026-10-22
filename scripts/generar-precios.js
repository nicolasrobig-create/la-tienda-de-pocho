// Crea src/data/precios.json con precios de EJEMPLO (COP) para cada id de productos.json.
// Solo agrega ids que faltan: nunca pisa precios ya cargados o editados a mano.
//
// Uso: node scripts/generar-precios.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVO_PRODUCTOS = path.join(RAIZ, 'src', 'data', 'productos.json');
const ARCHIVO_PRECIOS = path.join(RAIZ, 'src', 'data', 'precios.json');

// Nivel de precio por marca: 0 = económica, 1 = premium / veterinaria.
const NIVEL_MARCA = {
  Felix: 0, 'Country Value': 0, 'Nutra-Nuggets': 0.1, 'Siete Vidas': 0.15, Excellent: 0.2, Max: 0.2,
  'Cat Chow': 0.2, Monello: 0.3, Equilibrio: 0.35, 'Agility Gold': 0.4, Nupec: 0.45, BR: 0.5,
  'Pro Plan': 0.6, Evolve: 0.65, 'Diamond Naturals': 0.7, 'Taste of the Wild': 0.75, Nulo: 0.8,
  'N&D': 0.85, "Hill's": 0.9, Orijen: 1, Holliday: 0.9, VetLife: 0.95, Monge: 0.95, Virbac: 1,
};

// Rangos de ejemplo por peso (kg): [mínimo, máximo] en COP. Se interpola por nivel de marca
// y por peso entre puntos. Más allá del último punto crece de forma sublineal con el peso.
const PUNTOS = [
  [0.4, 25000, 40000],
  [0.5, 25000, 40000],
  [1.0, 45000, 62000],
  [1.5, 55000, 75000],
  [3.0, 120000, 180000],
];

function rangoParaPeso(kg) {
  const primero = PUNTOS[0];
  const ultimo = PUNTOS[PUNTOS.length - 1];
  if (kg <= primero[0]) return [primero[1], primero[2]];
  if (kg >= ultimo[0]) {
    const f = Math.pow(kg / ultimo[0], 0.85);
    return [ultimo[1] * f, ultimo[2] * f];
  }
  for (let i = 1; i < PUNTOS.length; i++) {
    const [k0, a0, b0] = PUNTOS[i - 1];
    const [k1, a1, b1] = PUNTOS[i];
    if (kg <= k1) {
      const t = (kg - k0) / (k1 - k0);
      return [a0 + (a1 - a0) * t, b0 + (b1 - b0) * t];
    }
  }
  return [ultimo[1], ultimo[2]];
}

const redondear = (n, paso = 500) => Math.round(n / paso) * paso;

const productos = JSON.parse(fs.readFileSync(ARCHIVO_PRODUCTOS, 'utf8'));
const precios = fs.existsSync(ARCHIVO_PRECIOS) ? JSON.parse(fs.readFileSync(ARCHIVO_PRECIOS, 'utf8')) : {};

let nuevos = 0;
const sinNivel = new Set();
for (const p of productos) {
  if (precios[p.id]) continue;
  if (!(p.marca in NIVEL_MARCA)) sinNivel.add(p.marca);
  const nivel = NIVEL_MARCA[p.marca] ?? 0.5;
  const [min, max] = rangoParaPeso(p.pesoKg);
  precios[p.id] = { precio: redondear(min + (max - min) * nivel), stock: true, esEjemplo: true };
  nuevos++;
}

// Quita ids que ya no existen en el catálogo.
const vigentes = new Set(productos.map((p) => p.id));
let huerfanos = 0;
for (const id of Object.keys(precios)) {
  if (!vigentes.has(id)) {
    delete precios[id];
    huerfanos++;
  }
}

fs.writeFileSync(ARCHIVO_PRECIOS, JSON.stringify(precios, null, 2) + '\n', 'utf8');
console.log(`precios.json: ${Object.keys(precios).length} entradas (${nuevos} nuevas, ${huerfanos} huérfanas quitadas)`);
if (sinNivel.size) console.log(`Marcas sin nivel definido (usaron 0.5): ${[...sinNivel].join(', ')}`);
