// Corre Lighthouse (móvil y escritorio) sobre el build de producción y muestra las 4 puntuaciones.
//   npm run build && npm run lighthouse
//   npm run lighthouse -- /catalogo /producto/felix-felino-triple-delicious-1-5-kg   (rutas a elección)
// Objetivo del proyecto: 90 o más en rendimiento, accesibilidad, mejores prácticas y SEO.
// Chrome: variable CHROME_PATH o rutas habituales. Guarda el resumen en docs/lighthouse.json.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import configEscritorio from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { servir } from './serve-dist.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = 4173;
const BASE = `http://localhost:${PUERTO}`;
const RUTAS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/', '/catalogo', '/marca/hills', '/producto/pro-plan-felino-adulto-3-kg', '/carrito', '/checkout', '/contacto', '/envios-y-devoluciones', '/nosotros', '/ingresar'];

// Páginas privadas con noindex a propósito: Lighthouse las marca como "bloqueadas para indexar" (SEO ~66).
const EXENTAS_SEO = ['/carrito', '/checkout', '/pedido-confirmado', '/ingresar'];

const chromePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean).find((c) => fs.existsSync(c));
if (!chromePath) throw new Error('No encontré Chrome. Define CHROME_PATH.');

const servidor = await servir(PUERTO);

const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
const resumen = [];
let bajos = 0;
try {
  for (const modo of ['mobile', 'desktop']) {
    for (const ruta of RUTAS) {
      const { lhr } = await lighthouse(BASE + ruta, { port: chrome.port, output: 'json', logLevel: 'error' }, modo === 'desktop' ? configEscritorio : undefined);
      const c = lhr.categories;
      const nota = { rendimiento: Math.round(c.performance.score * 100), accesibilidad: Math.round(c.accessibility.score * 100), 'buenas-practicas': Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100) };
      const lcp = lhr.audits['largest-contentful-paint'].displayValue;
      const fallidas = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && !['informative', 'notApplicable', 'manual'].includes(a.scoreDisplayMode)).map((a) => a.id);
      resumen.push({ modo, ruta, ...nota, lcp, auditoriasBajas: fallidas });
      const exenta = EXENTAS_SEO.includes(ruta);
      if (Object.entries(nota).some(([k, n]) => n < 90 && !(exenta && k === 'seo'))) bajos++;
      console.log(`${modo.padEnd(8)} ${ruta.padEnd(42)} rend ${String(nota.rendimiento).padStart(3)}  acc ${String(nota.accesibilidad).padStart(3)}  bp ${String(nota['buenas-practicas']).padStart(3)}  seo ${String(nota.seo).padStart(3)}${exenta ? '*' : ' '} LCP ${lcp}`);
    }
  }
} finally {
  await chrome.kill();
  servidor.close();
}
fs.writeFileSync(path.join(RAIZ, 'docs', 'lighthouse.json'), JSON.stringify(resumen, null, 2) + '\n');
console.log('* noindex a propósito (carrito/checkout): se excluye del objetivo de SEO.');
console.log(bajos ? `\n${bajos} medición(es) por debajo de 90. Detalle en docs/lighthouse.json` : '\nTodas las mediciones ≥ 90.');
process.exit(bajos ? 1 : 0);
