// Servidor estático de dist/ que se comporta como Vercel/Netlify:
//   1. si existe el archivo, lo sirve (ej. /assets/x.js, /og/y.jpg, /sitemap.xml)
//   2. si existe carpeta/index.html (las páginas prerrenderizadas de scripts/postbuild.js), lo sirve
//   3. si no, devuelve index.html (la SPA resuelve la ruta) — salvo archivos con extensión, que dan 404
// Comprime con gzip y pone cabeceras de caché como en vercel.json / netlify.toml.
// `vite preview` NO hace el paso 2, por eso el proyecto usa este script (`npm run preview`).
//
//   npm run build && npm run preview          → http://localhost:4173

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};
const COMPRIMIBLES = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt', '.svg', '.webmanifest']);
const cacheGzip = new Map();

function esArchivo(ruta) {
  try { return fs.statSync(ruta).isFile(); } catch { return false; }
}

export function servir(puerto = 4173) {
  const servidor = http.createServer((req, res) => {
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
    const base = path.join(DIST, path.normalize(ruta));
    if (!base.startsWith(DIST)) { res.writeHead(403).end(); return; }

    let archivo = [base, path.join(base, 'index.html')].find(esArchivo);
    if (!archivo) {
      if (path.extname(ruta) && path.extname(ruta) !== '.html') { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('No encontrado'); return; }
      archivo = path.join(DIST, 'index.html');
    }
    const ext = path.extname(archivo);
    const cabeceras = { 'Content-Type': TIPOS[ext] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' };
    if (ruta.startsWith('/assets/')) cabeceras['Cache-Control'] = 'public, max-age=31536000, immutable';
    else if (/^\/(productos|og)\//.test(ruta)) cabeceras['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800';
    else cabeceras['Cache-Control'] = 'public, max-age=0, must-revalidate';

    let cuerpo = fs.readFileSync(archivo);
    if (COMPRIMIBLES.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
      const clave = `${archivo}:${fs.statSync(archivo).mtimeMs}`;
      if (!cacheGzip.has(clave)) cacheGzip.set(clave, zlib.gzipSync(cuerpo, { level: 9 }));
      cuerpo = cacheGzip.get(clave);
      cabeceras['Content-Encoding'] = 'gzip';
      cabeceras.Vary = 'Accept-Encoding';
    }
    cabeceras['Content-Length'] = cuerpo.length;
    res.writeHead(200, cabeceras).end(req.method === 'HEAD' ? undefined : cuerpo);
  });
  return new Promise((resolve, reject) => {
    servidor.once('error', reject);
    servidor.listen(puerto, () => resolve(servidor));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('No existe dist/. Corre primero: npm run build');
    process.exit(1);
  }
  const puerto = Number(process.env.PORT) || 4173;
  await servir(puerto);
  console.log(`Sirviendo dist/ en http://localhost:${puerto} (Ctrl+C para salir)`);
}
