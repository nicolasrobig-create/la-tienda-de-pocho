# La Tienda de Pocho

Tienda online de alimento para gatos y perros en Bogotá, Colombia. Moneda: COP.
El cliente arma su carrito en la web y **envía el pedido por WhatsApp**; el costo del envío, la disponibilidad
y el pago se confirman por esa conversación. No hay pasarela de pago todavía.

**Stack:** React 19 · Vite · Tailwind CSS 4 · React Router 7. Sin backend: es un sitio estático.

> ⚠️ **Los precios que trae el proyecto son de ejemplo.** `src/data/precios.json` tiene un precio inventado por
> producto (marcados con `"esEjemplo": true`). Hay que reemplazarlos por los reales antes de publicar
> (ver [Reemplazar los precios](#reemplazar-los-precios-de-ejemplo)). La tienda no muestra ningún aviso al cliente.

## Contenido

1. [Requisitos e instalación](#requisitos-e-instalación)
2. [Comandos](#comandos)
3. [Estructura](#estructura)
4. [Generar el catálogo](#generar-el-catálogo)
5. [Reemplazar los precios de ejemplo](#reemplazar-los-precios-de-ejemplo)
6. [Configuración de la tienda](#configuración-de-la-tienda) (WhatsApp, contacto, zonas excluidas)
7. [Colores, tipografías y logo](#colores-tipografías-y-logo)
8. [Cómo funciona el pedido](#cómo-funciona-el-pedido)
9. [SEO](#seo)
10. [Pruebas y Lighthouse](#pruebas-y-lighthouse)
11. [Desplegar en Vercel o Netlify](#desplegar-en-vercel-o-netlify)
12. [Pendientes](#pendientes)

## Requisitos e instalación

- **Node.js 22.18 o superior** (se recomienda la 24; el archivo `.nvmrc` la indica). El build lee `src/config/store.ts` directamente con Node.
- Google Chrome o Edge, solo para las pruebas automáticas.

```bash
npm install
npm run dev        # sitio en modo desarrollo: http://localhost:5173
```

Para ver el sitio **tal como se publica** (con las páginas prerrenderizadas, gzip y cabeceras de caché):

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila a `dist/` y luego corre `scripts/postbuild.js` (HTML con SEO por ruta, imágenes para compartir, `sitemap.xml`, `robots.txt`) |
| `npm run preview` | Sirve `dist/` imitando a Vercel/Netlify (`scripts/serve-dist.mjs`) |
| `npm test` | Pruebas unitarias del pedido, los filtros y el formato de precios |
| `npm run test:e2e` | Flujo completo en Chrome (móvil y escritorio) y capturas en `docs/capturas/` |
| `npm run lighthouse` | Lighthouse móvil y escritorio sobre el build; resumen en `docs/lighthouse.json` |
| `npm run catalogo` | Regenera `productos.json` y las imágenes desde `Productos/` |
| `npm run precios` | Agrega a `precios.json` los productos nuevos (no toca los existentes) |
| `npm run og` | Regenera la imagen para compartir (`og-default.jpg`) y los íconos a partir de `favicon.svg` |

## Estructura

```
Productos/              Fotos y .docx originales (solo se leen; nunca se modifican)
public/productos/       Fotos WebP generadas, por marca (4 tamaños de cada una)
src/
  config/store.ts       ← Datos de la tienda: WhatsApp, contacto, zonas excluidas
  data/productos.json   Catálogo (SIN precios). Lo genera scripts/generar-catalogo.js
  data/precios.json     Precios y stock por id de producto. Se edita a mano
  index.css             ← Colores, tipografías y espaciado (bloque @theme)
  components/ pages/    Interfaz
  context/              Carrito (Context + localStorage)
  lib/                  Filtros, formato COP, lógica del pedido, textos SEO
scripts/                Generadores y utilidades de build
tests/                  Pruebas unitarias y e2e
docs/                   Brief de diseño, capturas, reportes
```

## Generar el catálogo

`scripts/generar-catalogo.js` lee la carpeta `Productos/` y produce:

- `src/data/productos.json`: `id`, `marca`, `tipoAnimal`, `nombre`, `presentacion`, `pesoKg`, `imagen`, `descripcion`, `ingredientes`, `beneficios`, `etiquetas`. **No incluye precio.**
- `public/productos/<marca>/<id>.webp` (1200 px de ancho, calidad 80) y las versiones `-240`, `-400` y `-800` para que las tarjetas no descarguen la foto grande.
- `docs/reporte-catalogo.json`: qué se leyó, qué faltó y las advertencias.

### Cómo debe estar organizada la carpeta

```
Productos/
  HILLS/
    F C/   ← felino (gatos)         C C/ ← canino (perros)
      ADULTO INDOOR 3.5 LB.jpeg     ← "[PRODUCTO] [PRESENTACIÓN].jpeg"
  FELIX/
    F C/
      TRIPLE DELICIOUS 1.5 KG.jpeg
      DESCRIPCION.docx              ← opcional: descripciones (una sección por producto)
```

La presentación es la **última** parte del nombre y puede ser `KG`, `GM` (gramos) o `LB` (libras; se convierte a kg para ordenar y filtrar).

```bash
node scripts/generar-catalogo.js                  # todas las marcas
node scripts/generar-catalogo.js --marca FELIX    # solo una marca (para probar)
node scripts/generar-catalogo.js --sin-imagenes   # solo los datos
```

Es repetible: no reprocesa fotos que ya están al día y no cambia los `id`. Como los precios viven en `precios.json`,
**actualizar precios no requiere regenerar el catálogo.**

### Datos que se editan en el script

Arriba de `scripts/generar-catalogo.js` hay tablas editables: nombre comercial de cada marca (`MARCAS`), errores de
tipeo en los nombres de archivo (`CORRECCIONES_NOMBRE`), nombres visibles para siglas (`NOMBRES_VISIBLES`), qué sección del
.docx corresponde a qué producto (`SECCIONES_DOCX`) y qué líneas son dietas veterinarias.

### Productos sin descripción

Si un producto no tiene descripción en un .docx, se genera un texto genérico (marca, animal y presentación) y queda marcado con
`"descripcionGenerica": true`. Cuando llegue el .docx faltante, agrégalo a la carpeta de la marca, mapea sus secciones en
`SECCIONES_DOCX` y corre `npm run catalogo`.

## Reemplazar los precios de ejemplo

`src/data/precios.json` tiene una entrada por `id` de producto:

```json
"hills-felino-adulto-indoor-3-5-lb": { "precio": 78000, "stock": true, "esEjemplo": true }
```

1. Edita el `precio` (pesos colombianos, número entero, sin puntos ni símbolo).
2. Pon `"esEjemplo": false` (o quita el campo) cuando el precio sea real.
3. `"stock": false` muestra el producto como **Agotado** y bloquea "Agregar".
4. `"precio": null` muestra **Consultar precio** y deja el producto fuera del total del carrito.

Para saber qué precios siguen siendo de ejemplo:

```bash
node -e "const p=require('./src/data/precios.json');console.log(Object.entries(p).filter(([,v])=>v.esEjemplo).length,'de',Object.keys(p).length,'son de ejemplo')"
```

Si agregas productos nuevos con `npm run catalogo`, `npm run precios` crea su entrada de ejemplo sin tocar las demás.

## Configuración de la tienda

Todo está en **`src/config/store.ts`**.

### Número de WhatsApp

```ts
whatsapp: '573015885529',   // solo dígitos, con 57 (Colombia) al inicio
```

- Si queda **vacío** o con el texto `'[NÚMERO DE WHATSAPP]'`, el checkout **no abre WhatsApp**: muestra la pantalla de confirmación con el
  pedido listo para copiar y enviar por Facebook, y **no vacía el carrito**.
- Con un número válido, el botón del checkout abre `https://wa.me/<número>?text=<pedido>` y el carrito se vacía.

### Datos de contacto

`telefono`, `email`, `direccion` y `horario` aparecen en el pie de página y en Contacto. Los campos vacíos se ocultan.
`url` es la dirección pública del sitio (ver [SEO](#seo)).

### Zonas excluidas de envío

```ts
zonasExcluidas: ['Sumapaz', 'Usme'],   // barrios, localidades o palabras clave
```

- El checkout rechaza una dirección o barrio que **contenga** alguna de esas palabras (sin distinguir mayúsculas ni tildes)
  y muestra: *"Por ahora no hacemos entregas en …"*.
- La página **Envíos y devoluciones** y el checkout muestran la lista.
- Vacía (`[]`) significa que no se excluye ninguna zona.
- El costo y la disponibilidad del envío se confirman siempre por WhatsApp según la zona (así lo dice la página de Envíos).

## Colores, tipografías y logo

- **Colores, tipografías, radios y sombras:** bloque `@theme` de `src/index.css`. Es el único lugar: cambiar `--color-terracota`
  cambia todo el sitio. Guía completa en `docs/brief-diseno.md`. Los contrastes están medidos (WCAG AA); si cambias un color, revisa que
  siga cumpliendo 4,5:1 con su fondo.
- **Tipografías:** Fraunces (títulos) y Figtree (texto), alojadas en el propio sitio con `@fontsource-variable`. Para cambiarlas:
  instala otra familia de `@fontsource-variable/...`, impórtala en `src/main.jsx` y actualiza `--font-display` / `--font-sans`.
- **Logo:** hoy es provisional (un plato de comida). Para ponerlo definitivo:
  1. Reemplaza el contenido de `src/components/layout/Logo.jsx` (componente `Marca`) por tu SVG o una `<img>`.
  2. Reemplaza `public/favicon.svg` por el nuevo.
  3. Corre `npm run og` para regenerar los íconos (`favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png`) y la imagen para
     compartir (`og-default.jpg`; edita el texto y las fotos en `scripts/generar-og.js` si quieres otro diseño).

## Cómo funciona el pedido

1. El carrito guarda solo `{ id, cantidad }` en `localStorage` (clave `pocho:carrito:v1`). Nombre, foto y precio se leen del catálogo
   en cada vista, así que un cambio en `precios.json` se refleja sin vaciar el carrito.
2. En `/checkout` el cliente completa nombre, teléfono, dirección, barrio o localidad y notas. Se valida todo (celular de 10 dígitos o
   fijo de Bogotá, dirección y barrio completos, zonas excluidas, máximo de caracteres) con mensajes claros.
3. Al confirmar se arma el mensaje (código del pedido, detalle por producto, total, datos de entrega) y se abre WhatsApp.
4. La pantalla `/pedido-confirmado` explica los pasos siguientes y permite abrir WhatsApp de nuevo o copiar el mensaje.

**Datos personales:** nombre, teléfono y dirección **no se guardan** en `localStorage`, `sessionStorage` ni en la URL. Viven solo en memoria
mientras se completa el formulario; la pantalla de confirmación recibe el pedido por el estado de navegación y lo borra del historial
del navegador en cuanto se muestra (al recargar ya no está).

## SEO

Cada página define su título y descripción (`src/lib/seo.js`) y, al compilar, `scripts/postbuild.js` escribe un HTML por ruta con su
`<title>`, `description`, `canonical` y Open Graph (por eso Facebook y WhatsApp muestran la foto del producto al compartir un enlace).
También genera `sitemap.xml`, `robots.txt` y una imagen de 1200×630 por producto y por marca (`dist/og/`).
El carrito, el checkout, la confirmación y los resultados de búsqueda llevan `noindex`.

**La URL pública del sitio se toma, en este orden, de:** `url` en `src/config/store.ts` → variable de entorno `SITE_URL` → la URL que
exponen Netlify (`URL`) o Vercel (`VERCEL_PROJECT_PRODUCTION_URL`). Si no hay ninguna, el build avisa y usa `http://localhost:4173`
(válido solo para pruebas locales). Cuando tengas dominio propio, ponlo en `url` o en `SITE_URL`.

## Pruebas y Lighthouse

```bash
npm test             # 12 pruebas unitarias (node:test)
npm run build && npm run test:e2e
npm run lighthouse   # o: npm run lighthouse -- /catalogo /producto/<id>
```

`test:e2e` recorre buscar → filtrar → ordenar → agregar al carrito (ficha y tarjeta) → cambiar cantidades → checkout con errores →
pedido por WhatsApp (se intercepta la apertura y se verifica la URL y el contenido del mensaje) → confirmación, en móvil (390 px) y
escritorio (1280 px). También comprueba que no haya datos personales en el almacenamiento del navegador y que no haya errores de consola.
Las capturas quedan en `docs/capturas/`.

**Resultados de Lighthouse** (build de producción local, `docs/lighthouse.json`; entre corridas varían unos puntos):

| Página | Rendimiento (móvil / escritorio) | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Inicio | 92 / 100 | 100 | 100 | 100 |
| Catálogo | 87–92 / 99 | 100 | 100 | 100 |
| Marca | 83–87 / 99–100 | 100 | 100 | 100 |
| Producto | 94 / 100 | 100 | 100 | 100 |
| Contacto, Envíos, Nosotros | 98 / 100 | 100 | 100 | 100 |
| Carrito, Checkout | 97 / 97 | 100 | 100 | 66 (por diseño: `noindex`) |

Las páginas con muchas fotos (catálogo y marca) quedan en el borde del objetivo de 90 en móvil con el throttling pesimista de Lighthouse
(red 4G lenta y CPU 4× más lenta); el peso es React + React Router (~100 KB gzip), no el código de la tienda.

## Desplegar en Vercel o Netlify

El repositorio ya incluye `vercel.json` y `netlify.toml` (comando de build, carpeta `dist`, caché larga para `assets/`, `productos/` y `og/`,
cabeceras de seguridad y regla para que cualquier ruta caiga en la SPA). **Las páginas con HTML propio (producto, marca…) se sirven tal cual;
el resto cae en `index.html`.**

### Vercel

1. Sube el proyecto a un repositorio (GitHub, GitLab o Bitbucket). `.gitignore` ya excluye `node_modules` y `dist`.
2. En vercel.com: **Add New → Project** → importa el repositorio. Vercel detecta Vite; no cambies nada.
3. Deploy. Vercel define `VERCEL_PROJECT_PRODUCTION_URL`, así que el sitemap y los enlaces para compartir salen con la URL correcta.
4. Dominio propio: **Settings → Domains**. Después pon ese dominio en `url` (`src/config/store.ts`) o en la variable `SITE_URL`.

Con la CLI: `npx vercel` (prueba) y `npx vercel --prod`. `.vercelignore` deja fuera `Productos/` (las fotos originales) para que no se suban.

### Netlify

1. Sube el proyecto a un repositorio.
2. En netlify.com: **Add new site → Import an existing project** → elige el repositorio. Toma el comando y la carpeta de `netlify.toml`.
3. Deploy. Netlify define `URL`, que el build usa para el sitemap y los enlaces para compartir.
4. Dominio propio: **Domain management**. Luego actualiza `url` o `SITE_URL`.

### Antes de publicar

- [ ] Precios reales en `precios.json` (y `esEjemplo` en `false`).
- [ ] Número de WhatsApp, teléfono, correo, dirección y horario revisados en `src/config/store.ts`.
- [ ] Zonas excluidas y textos de **Envíos y devoluciones** y **Sobre nosotros** confirmados (`src/pages/Envios.jsx`, `Nosotros.jsx`).
- [ ] Logo definitivo.
- [ ] Probar un pedido completo en el sitio publicado, desde un celular.
- [ ] Fotos con precios escritos a mano en las bolsas (lista en `docs/reporte-catalogo.json` y en el resumen de la Fase 1): retomarlas o taparlas.

## Pendientes

- Pasarela de pago (hoy el pago se acuerda por WhatsApp).
- Descripciones reales para los productos que usan el texto genérico (faltan los .docx de Cat Chow, Diamond Naturals y Nupec, que llegaron vacíos, y de varias marcas más).
- Accesorios: el catálogo actual es solo alimento.
