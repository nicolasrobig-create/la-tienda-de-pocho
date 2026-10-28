// Prueba de punta a punta del flujo de compra, en móvil y escritorio, con Chrome real (puppeteer-core).
//   npm run build && npm run test:e2e
// Levanta scripts/serve-dist.mjs (imita a Vercel/Netlify) en el puerto 4173, recorre: buscar → filtrar → ordenar → agregar al carrito →
// cambiar cantidades → checkout → pedido por WhatsApp, y guarda capturas en docs/capturas/.
// Chrome: variable CHROME_PATH, o se busca en las rutas habituales de Windows, macOS y Linux.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { servir } from '../scripts/serve-dist.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAPTURAS = path.join(RAIZ, 'docs', 'capturas');
const PUERTO = 4173;
const BASE = `http://localhost:${PUERTO}`;
const NUMERO_ESPERADO = '573015885529'; // el de src/config/store.ts

function buscarChrome() {
  const candidatos = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const ruta = candidatos.find((c) => fs.existsSync(c));
  if (!ruta) throw new Error('No encontré Chrome. Define CHROME_PATH con la ruta del ejecutable.');
  return ruta;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const resultados = [];
const errores = [];
let fallos = 0;
const comprobar = (nombre, ok, detalle = '') => {
  if (!ok) fallos++;
  resultados.push(`${ok ? 'OK   ' : 'FALLA'} ${nombre}${detalle ? ` — ${detalle}` : ''}`);
};


const digitos = (t) => Number(String(t).replace(/\D/g, ''));

async function flujo(browser, { nombre, ancho, alto, movil }) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: ancho, height: alto, isMobile: movil, hasTouch: movil, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => errores.push(`[${nombre}] ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(`[${nombre}] ${m.text()}`); });
  // Intercepta WhatsApp: guarda la URL en vez de abrir una pestaña.
  await p.evaluateOnNewDocument(() => {
    window.__wa = [];
    window.open = (u) => { window.__wa.push(String(u)); return null; };
  });
  const foto = (n, completa = false) => p.screenshot({ path: path.join(CAPTURAS, `${nombre}-${n}.png`), fullPage: completa });
  const t = (txt) => `[${nombre}] ${txt}`;

  // 1. Inicio
  // Inicio baja el video de la portada y el navegador mantiene esa solicitud (blob:) abierta como medio: no se espera red inactiva.
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.waitForSelector('h1');
  await dormir(400);
  await foto('01-inicio');
  comprobar(t('Inicio carga con h1'), (await p.$eval('h1', (e) => e.textContent)).includes('Buena comida'));

  // 2. Buscar (sin tildes)
  const buscador = movil ? '#buscar-movil' : '#buscar-escritorio';
  await p.click(movil ? 'button[aria-label="Abrir menú"]' : 'button[aria-label="Abrir buscador"]');
  await p.waitForSelector(`dialog[open] ${buscador}`);
  await p.type(buscador, 'urinario');
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => location.search.includes('q=urinario') && document.querySelectorAll('article').length > 0);
  comprobar(t('Buscar "urinario" muestra resultados'), (await p.$$('article')).length >= 5);
  await dormir(500);
  await foto('02-busqueda');

  // 3. Filtrar por marca (panel lateral en escritorio, diálogo en móvil) y ordenar
  await p.goto(BASE + '/catalogo?animal=gato', { waitUntil: 'networkidle0' });
  if (movil) {
    await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Filtros')).click());
    await p.waitForSelector('dialog[open] #m-marca-pro-plan');
    await dormir(300);
    await foto('03-filtros');
    await p.click('dialog[open] #m-marca-pro-plan');
    await p.keyboard.press('Escape');
  } else {
    await p.click('#d-marca-pro-plan');
  }
  await p.waitForFunction(() => location.search.includes('marca=pro-plan'));
  await p.select('#orden', 'precio-asc');
  await dormir(300);
  const marcas = await p.$$eval('article > div:last-child > p:first-child', (els) => els.map((e) => e.textContent.trim().toLowerCase()));
  comprobar(t('Filtro por marca: todas las tarjetas son Pro Plan'), marcas.length > 0 && marcas.every((m) => m === 'pro plan'), `${marcas.length} productos`);
  const precios = await p.$$eval('article p.tabular-nums', (els) => els.map((e) => Number(e.textContent.replace(/\D/g, ''))));
  comprobar(t('Orden por precio ascendente'), precios.every((v, i) => i === 0 || v >= precios[i - 1]));
  await foto('04-catalogo-filtrado');

  // 4. Producto: ficha, cantidad y agregar
  await p.click('article h3 a');
  await p.waitForSelector('h1');
  await dormir(300);
  const nombreProducto = await p.$eval('h1', (e) => e.textContent.trim());
  await foto('05-producto');
  await p.click('button[aria-label="Una unidad más"]');
  await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Agregar al carrito')).click());
  await dormir(300);
  comprobar(t('Agregar desde la ficha (2 unidades)'), (await p.$eval('a[href="/carrito"]', (a) => a.getAttribute('aria-label'))).includes('2 productos'));

  // 5. Agregar otro desde el catálogo
  await p.goto(BASE + '/catalogo?marca=hills', { waitUntil: 'networkidle0' });
  await p.click('article button[aria-label^="Agregar"]');
  await dormir(300);
  comprobar(t('Agregar desde la tarjeta'), (await p.$eval('a[href="/carrito"]', (a) => a.getAttribute('aria-label'))).includes('3 productos'));

  // 6. Carrito: cambiar cantidades, quitar y verificar el total
  await p.goto(BASE + '/carrito', { waitUntil: 'networkidle0' });
  const lineasAntes = (await p.$$('section[aria-label="Productos en el carrito"] > ul > li')).length;
  comprobar(t('Carrito con 2 líneas'), lineasAntes === 2);
  const subir = await p.$$('button[aria-label="Una unidad más"]');
  await subir[1].click();
  await dormir(200);
  const suma = await p.$$eval('section[aria-label="Productos en el carrito"] > ul > li p.font-bold', (els) => els.map((e) => Number(e.textContent.replace(/\D/g, ''))));
  const total = digitos(await p.$eval('aside dd:last-child', (e) => e.textContent));
  comprobar(t('Total = suma de subtotales'), suma.reduce((a, b) => a + b, 0) === total, `${total}`);
  await foto('06-carrito');
  await p.click('a[href="/checkout"]');
  await p.waitForSelector('main form');

  // 7. Checkout: errores y luego pedido válido
  await p.click('main form button[type=submit]');
  await dormir(200);
  const errs = await p.$$eval('main form [role=alert]', (els) => els.map((e) => e.textContent));
  comprobar(t('Checkout vacío: 4 errores claros'), errs.length === 4, errs.join(' | ').slice(0, 120));
  comprobar(t('Foco en el primer campo con error'), await p.evaluate(() => document.activeElement?.getAttribute('aria-invalid') === 'true'));
  await foto('07-checkout-errores');

  const campos = await p.$$('main form input, main form textarea');
  await campos[0].type('Ana María Pérez');
  await campos[1].type('123');
  await campos[2].type('Barrio Colina');
  await campos[3].type('Carrera 69 #98-29, apto 301');
  await campos[4].type('Dejar con el portero');
  await p.click('main form button[type=submit]');
  await dormir(200);
  comprobar(t('Teléfono inválido se rechaza'), await p.evaluate(() => document.body.textContent.includes('un celular tiene 10 dígitos')));
  await p.focus('main form input[type=tel]');
  await p.keyboard.down('Control');
  await p.keyboard.press('a');
  await p.keyboard.up('Control');
  await p.keyboard.type('300 123 4567');
  await foto('08-checkout-completo');
  await p.click('main form button[type=submit]');
  await p.waitForFunction(() => location.pathname === '/pedido-confirmado');

  // 8. WhatsApp y confirmación
  const abiertos = await p.evaluate(() => window.__wa);
  comprobar(t('Se abrió WhatsApp una vez'), abiertos.length === 1);
  const url = abiertos[0] ?? '';
  comprobar(t('URL de wa.me con el número configurado'), url.startsWith(`https://wa.me/${NUMERO_ESPERADO}?text=`), url.slice(0, 40));
  const mensaje = decodeURIComponent(url.split('text=')[1] ?? '');
  comprobar(t('Mensaje con productos, total y datos'), mensaje.includes(nombreProducto) && mensaje.includes('Total productos') && mensaje.includes('Ana María Pérez') && mensaje.includes('3001234567'.slice(0, 3)) && mensaje.includes('Dejar con el portero'));
  await dormir(500);
  comprobar(t('Pantalla de confirmación con código'), (await p.$eval('body', (b) => b.textContent)).includes('Código del pedido: P-'));
  await foto('09-confirmacion', true);

  // 9. Privacidad y carrito vaciado
  const almacenado = await p.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  comprobar(t('Sin datos personales en localStorage/sessionStorage'), !/Ana|300|Colina|portero|98-29/.test(almacenado), almacenado.slice(0, 60));
  comprobar(t('Carrito vaciado tras enviar'), (await p.$eval('a[href="/carrito"]', (a) => a.getAttribute('aria-label'))).includes('0 productos'));
  await p.reload({ waitUntil: 'networkidle0' });
  comprobar(t('Al recargar la confirmación no persiste el pedido'), (await p.$eval('h1', (e) => e.textContent)).includes('No encontramos un pedido reciente'));

  // 10. Páginas estáticas: sin scroll horizontal
  for (const ruta of ['/', '/catalogo', '/marca/hills', '/envios-y-devoluciones', '/contacto', '/nosotros', '/ingresar', '/carrito', '/checkout', '/no-existe']) {
    await p.goto(BASE + ruta, { waitUntil: ruta === '/' ? 'load' : 'networkidle0' }); // Inicio mantiene abierta la solicitud del video
    const [sw, cw] = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (sw > cw) comprobar(t(`Sin scroll horizontal en ${ruta}`), false, `${sw}>${cw}`);
  }
  await p.goto(BASE + '/envios-y-devoluciones', { waitUntil: 'networkidle0' });
  await foto('10-envios');
  comprobar(t('Envíos indica que el costo se confirma por WhatsApp'), (await p.$eval('main', (m) => m.textContent)).includes('se confirman por WhatsApp según tu zona'));
  await ctx.close();
}

fs.mkdirSync(CAPTURAS, { recursive: true });
const srv = await servir(PUERTO);
const browser = await puppeteer.launch({ executablePath: buscarChrome(), headless: 'new' });
try {
  await flujo(browser, { nombre: 'movil', ancho: 390, alto: 844, movil: true });
  await flujo(browser, { nombre: 'escritorio', ancho: 1280, alto: 900, movil: false });
} catch (e) {
  fallos++;
  resultados.push(`FALLA excepción: ${e.message}`);
} finally {
  await browser.close();
  srv.close();
}

comprobar('Sin errores de consola ni de página', errores.length === 0, [...new Set(errores)].join(' | ').slice(0, 200));
console.log(resultados.join('\n'));
console.log(`\n${fallos === 0 ? 'TODO OK' : `${fallos} fallo(s)`} · capturas en docs/capturas/`);
process.exit(fallos === 0 ? 0 : 1);
