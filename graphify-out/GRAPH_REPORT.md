# Graph Report - rediseno-marca  (2026-10-26)

## Corpus Check
- 66 files · ~25,807 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 412 nodes · 1047 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Rutas y Error Boundary
- Tarjetas de producto
- Servidor y OG (Node)
- Catálogo y filtros
- Generador de catálogo
- Dependencias de desarrollo
- Brief de diseño
- Postbuild y prerrenderizado
- Dependencias de producción
- Configuración Vercel
- Logo principal
- Icono Apple touch
- Icono 192
- Icono 512
- Logo 2x
- Marca gato
- Favicon 32

## God Nodes (most connected - your core abstractions)
1. `Icono()` - 42 edges
2. `Boton()` - 28 edges
3. `usePagina()` - 28 edges
4. `react` - 23 edges
5. `react-router-dom` - 22 edges
6. `ExplorarCatalogo()` - 19 edges
7. `formatearPrecio()` - 19 edges
8. `EstadoVacio()` - 18 edges
9. `Checkout()` - 18 edges
10. `Migas()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Tipografías Fraunces y Figtree` --semantically_similar_to--> `Bloque @theme (src/index.css)`  [INFERRED] [semantically similar]
  docs/brief-diseno.md → README.md
- `Tipografías Fraunces y Figtree` --conceptually_related_to--> `index.html (entrada de la SPA)`  [AMBIGUOUS]
  docs/brief-diseno.md → index.html
- `etiquetas()` --calls--> `tituloCompleto()`  [EXTRACTED]
  scripts/postbuild.js → src/lib/seo.js
- `Brief de diseño - La Tienda de Pocho` --references--> `productos.json (catálogo sin precios)`  [EXTRACTED]
  docs/brief-diseno.md → README.md
- `Brief de diseño - La Tienda de Pocho` --references--> `precios.json (precios y stock, de ejemplo)`  [EXTRACTED]
  docs/brief-diseno.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Sistema de diseño de marca (paleta, tipografías, espaciado)** — docs_brief_diseno_paleta_marca, docs_brief_diseno_tipografias, docs_brief_diseno_espaciado_layout, readme_theme_index_css [EXTRACTED 0.95]
- **Flujo de pedido: carrito, checkout y WhatsApp** — readme_carrito_localstorage, readme_pedido_por_whatsapp, readme_store_ts_config, readme_privacidad_datos_personales [EXTRACTED 0.95]
- **Datos del catálogo (generador, productos, precios)** — readme_generar_catalogo, readme_productos_json, readme_precios_json [EXTRACTED 0.95]

## Communities (17 total, 1 thin omitted)

### Community 0 - "Rutas y Error Boundary"
Cohesion: 0.10
Nodes (43): react-router-dom, ErrorBoundary, Boton(), VARIANTES, EstadoVacio(), Foto(), Migas(), fijar() (+35 more)

### Community 1 - "Tarjetas de producto"
Cohesion: 0.11
Nodes (40): react, TarjetaProducto(), AvisoAgregado(), Buscador(), Footer(), WHATSAPP, ENLACES, Header() (+32 more)

### Community 2 - "Servidor y OG (Node)"
Cohesion: 0.05
Nodes (36): fondo, PUBLIC, RAIZ, ARCHIVO_PRECIOS, ARCHIVO_PRODUCTOS, NIVEL_MARCA, productos, PUNTOS (+28 more)

### Community 3 - "Catálogo y filtros"
Cohesion: 0.13
Nodes (34): ExplorarCatalogo(), alternar(), Casilla(), Grupo(), PanelFiltros(), Campo(), useMediaQuery(), ANIMALES (+26 more)

### Community 4 - "Generador de catálogo"
Cohesion: 0.07
Nodes (41): ANCHOS_EXTRA, ARCHIVO_CATALOGO, ARCHIVO_REPORTE, args, CARPETAS_SUELTAS, carpetasDeMarca(), CORRECCIONES_NOMBRE, descripcionGenerica() (+33 more)

### Community 5 - "Dependencias de desarrollo"
Cohesion: 0.07
Nodes (37): devDependencies, chrome-launcher@^1.2.2, lighthouse@^13.5.0, mammoth@^1.13.0, puppeteer-core@^25.16.0, sharp@^0.35.5, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3 (+29 more)

### Community 6 - "Brief de diseño"
Cohesion: 0.07
Nodes (28): Aviso de dietas veterinarias, Brief de diseño - La Tienda de Pocho, Contraste WCAG AA, Espaciado y layout móvil primero, Fotos de producto (contain) vs fotos reales (cover, componente Foto), Logo (fuente de la paleta), Paleta de marca (azul, durazno, ámbar), Qué evitar en el diseño (+20 more)

### Community 7 - "Postbuild y prerrenderizado"
Cohesion: 0.09
Nodes (27): chunksDe(), DIST, entradaPrincipal, esc(), escribirRuta(), etiquetas(), fotos, fuentes (+19 more)

### Community 8 - "Dependencias de producción"
Cohesion: 0.13
Nodes (21): dependencies, @fontsource-variable/figtree@^5.3.0, @fontsource-variable/fraunces@^5.3.0, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.4, @fontsource-variable/figtree, @fontsource-variable/fraunces (+13 more)

### Community 9 - "Configuración Vercel"
Cohesion: 0.22
Nodes (8): buildCommand, cleanUrls, framework, headers, outputDirectory, rewrites, $schema, trailingSlash

### Community 10 - "Logo principal"
Cohesion: 0.67
Nodes (3): Logo La Tienda de Pocho, White cat mascot (Pocho) with whiskers, in place of the final O, Wordmark 'La Tienda de POCHO' (cream letters on blue, bold rounded type)

### Community 11 - "Icono Apple touch"
Cohesion: 0.67
Nodes (3): Fondo azul solido de marca, Mascota gato crema ilustrado (cara con ojos verdes y bigotes), apple-touch-icon.png (icono de la tienda)

### Community 12 - "Icono 192"
Cohesion: 0.67
Nodes (3): Solid royal blue background (brand palette), Cat mascot (cream/siamese cat face, flat vector style), App icon 192x192 (cream cat face on blue)

### Community 13 - "Icono 512"
Cohesion: 0.67
Nodes (3): icon-512.png (app icon 512x512), Solid royal blue background (brand blue), Cream-colored cat face illustration (brand mascot/logo)

### Community 14 - "Logo 2x"
Cohesion: 0.67
Nodes (3): Paleta de marca: fondo azul, texto blanco/crema, Gato crema (mascota Pocho), Logo La Tienda de Pocho (2x)

### Community 15 - "Marca gato"
Cohesion: 0.67
Nodes (3): Marca gato (ilustración de cara de gato crema sobre fondo azul), Fondo azul de marca (paleta azul/ámbar), Mascota: gato crema de ojos verdes y bigotes

## Ambiguous Edges - Review These
- `Tipografías Fraunces y Figtree` → `index.html (entrada de la SPA)`  [AMBIGUOUS]
  docs/brief-diseno.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `Stack React 19 + Vite + Tailwind 4 + React Router 7`, `Generador de catálogo (scripts/generar-catalogo.js)`, `Zonas excluidas de envío`, `Pruebas unitarias, e2e y Lighthouse`, `Despliegue en Vercel o Netlify` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 152 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sharp` connect `Dependencias de desarrollo` to `Servidor y OG (Node)`, `Generador de catálogo`, `Postbuild y prerrenderizado`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `Stack React 19 + Vite + Tailwind 4 + React Router 7`, `Generador de catálogo (scripts/generar-catalogo.js)`, `Zonas excluidas de envío` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rutas y Error Boundary` be split into smaller, more focused modules?**
  _Cohesion score 0.09575012800819252 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Tarjetas de producto` to `Dependencias de producción`, `Rutas y Error Boundary`, `Catálogo y filtros`, `Dependencias de desarrollo`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `Tarjetas de producto` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Rutas y Error Boundary` to `Dependencias de producción`, `Tarjetas de producto`, `Catálogo y filtros`, `Dependencias de desarrollo`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Tipografías Fraunces y Figtree` and `index.html (entrada de la SPA)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._