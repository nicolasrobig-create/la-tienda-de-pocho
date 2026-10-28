# Brief de diseño — La Tienda de Pocho

Tienda online de alimento y accesorios para mascotas en Bogotá, Colombia. Moneda: COP.
Facebook: https://www.facebook.com/LaTiendadePocho/

> Fuente única de verdad de colores, tipografías y espaciado: el bloque `@theme` de `src/index.css`.
> No se escriben valores hex, `px` sueltos ni fuentes en componentes: se usan las utilidades/variables de ahí.

## 1. Personalidad y tono

Una tienda de barrio con buen surtido: cercana, confiable, sin ruido. Habla como el dueño de la tienda
que conoce a tu mascota por el nombre, no como un catálogo corporativo.

- **Español neutro cercano**: tuteo ("tu gato", "elige", "llévalo"), sin voseo y sin regionalismos fuertes.
- **Frases cortas, verbos concretos.** "Agregar al carrito", no "Proceda a añadir el artículo".
- **Cálido pero no infantil.** Sin diminutivos en exceso ni signos de exclamación en cadena; un "¡Listo!" basta.
- **Honesto con la información.** Los productos veterinarios llevan un aviso ("Uso bajo supervisión veterinaria").
  No prometemos curas ni resultados médicos.
- **Precios siempre claros**: `$45.000` (punto de miles, sin decimales, `Intl.NumberFormat('es-CO')`).
- **Pesos**: `1,5 kg`, `500 g`, `7 lb` (coma decimal, unidad en minúscula).
- Mensajes de error con salida: "No encontramos ese producto. Mira todo el alimento para gatos."

## 2. Paleta de marca

Sale del logo: el azul del fondo, el durazno de las letras "POCHO" y el crema del gato. El ámbar es el único color que
no está en el logo: se eligió como complementario cálido del azul. Definida como tokens en `@theme` (`src/index.css`).
Contrastes medidos (WCAG, mínimo AA = 4,5:1 en texto, 3:1 en componentes y texto grande):

| Rol | Token | Valor | Uso | Contraste |
|---|---|---|---|---|
| Primario | `azul` | `#0B4390` | Header, botón principal, enlaces, precios | 9,1:1 sobre fondo · blanco sobre azul 9,5:1 |
| Primario (hover) | `azul-oscuro` | `#083570` | Hover / activo, enlaces sobre claro | 11,5:1 sobre fondo |
| Texto oscuro | `noche` | `#0A2A63` | Texto principal, footer, bandas oscuras | 13,2:1 sobre fondo |
| — | `noche-suave` | `#44567F` | Texto secundario | 7,0:1 sobre fondo · 5,5:1 sobre durazno |
| Fondo | `fondo` | `#FBE9C6` | Fondo de página y marco de la portada (crema fuerte) | noche 11,5:1 |
| Secundario | `durazno` | `#F4C9A6` | Chips, íconos, superficies | noche 9,0:1 · noche-suave 4,8:1 |
| — | `durazno-claro` | `#FDEEE0` | Bandas amplias, esqueletos de carga | — |
| — | `durazno-oscuro` | `#E6C2A8` | Bordes y divisores | decorativo |
| Acento | `ambar` | `#FFB020` | Badges, CTA sobre azul, hover, activo del menú | noche sobre ámbar 7,5:1 · ámbar sobre azul 4,7:1 (solo texto grande) |
| Funcional | `oliva` | `#4F6B2E` | "Disponible", confirmaciones | blanco sobre oliva 6,0:1 |

Reglas:
- Fondo de página siempre `fondo`; las tarjetas suben a `blanco` o `durazno` con `--shadow-tarjeta`.
- **Azul = acción y marca; ámbar = énfasis.** `ambar` nunca es texto sobre fondo claro (no pasa AA); sobre azul solo en
  textos grandes o iconos. Sobre ámbar el texto es siempre `noche`.
- Dentro de zonas azules (header, footer, hero) se añade la clase `sobre-oscuro`: el anillo de foco pasa de azul a ámbar.
- Degradados: `degradado-marca` (azul → noche), `degradado-hero` (igual, con halo de azul claro) y `degradado-calido`
  (durazno claro → fondo). Un halo ámbar sobre azul se mezcla en gris: no usarlo.
- Un solo radio para tarjetas (`--radius-tarjeta`, 1,25 rem) y píldora para botones; sombras teñidas de azul noche.
- Hover: `.elevar` (sube 3 px y gana sombra) en tarjetas; los botones suben 2 px. Todo se anula con `prefers-reduced-motion`.
- Nunca negro puro ni gris frío: todos los neutros salen de `noche`.
- No comunicar estado solo con color (stock/sin stock llevan texto o ícono).
- Las fotos de producto son fotos reales de bolsas con fondos variados: mostrarlas sobre `blanco` o `durazno`
  con `object-fit: contain` y esquinas redondeadas, sin recortar la bolsa.
- Las fotos reales de la tienda y de mascotas (`public/fotos/`) sí se recortan (`object-cover`), con el componente `Foto`.

## 3. Tipografías

| Rol | Fuente | Pesos | Variable |
|---|---|---|---|
| Títulos, precios destacados | **Fraunces** (serif con carácter, cálida) | 500, 700 | `font-display` |
| Texto, interfaz, botones | **Figtree** (sans geométrica, muy legible en pantallas chicas) | 400, 500, 600, 700 | `font-sans` |

- Se cargan desde Google Fonts en `index.html` con `display=swap`.
- Cuerpo: 16 px mínimo (1 rem), interlineado 1,6. Títulos: interlineado 1,15, `text-wrap: balance`.
- Escala sugerida (móvil → escritorio): H1 `2rem → 3rem`, H2 `1.5rem → 2rem`, H3 `1.25rem`, texto `1rem`, notas `0.875rem`.
- Los precios y nombres de producto usan números tabulares (`tabular-nums`) para que las columnas alineen.
- Máximo ~70 caracteres por línea en textos largos (descripciones).

## 4. Espaciado y layout

- **Base de 4 px** (escala de Tailwind: `1 = 4px`). Se usan solo múltiplos: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Contenedor: `max-w-6xl`, margen lateral `px-4` en móvil, `px-6` desde `md`, `px-8` desde `lg`.
- Separación entre secciones: `py-12` móvil, `py-20` escritorio. Dentro de una tarjeta: `p-4` móvil, `p-5` escritorio.
- Grilla de productos: 2 columnas en móvil (`gap-3`), 3 en `md`, 4 en `lg` (`gap-6`).
- **Móvil primero**: la mayoría de los clientes llegan desde Facebook/WhatsApp en el celular.
  Diseñar primero a 360 px de ancho; nada de scroll horizontal.
- Objetivos táctiles de al menos 44 × 44 px (botones, chips de filtro, ícono de carrito).
- Radios: tarjetas `--radius-tarjeta` (1 rem), botones `--radius-boton` (píldora). No mezclar otros radios.
- Un solo nivel de sombra (`--shadow-tarjeta`); no apilar sombras.

## 5. Componentes y patrones (guía para la Fase 2)

- **Tarjeta de producto**: foto en proporción 4:5 sobre `blanco`, marca en `noche-suave` (mayúsculas pequeñas),
  nombre en `font-display`, presentación como chip, precio grande, botón "Agregar".
- **Filtros**: por animal (gatos/perros), marca, etapa (gatito/adulto/senior) y necesidad
  (urinario, control de peso, bolas de pelo…) usando las `etiquetas` del catálogo.
- **Productos veterinarios** (etiqueta `dieta veterinaria`): aviso visible en la tarjeta y la ficha.
- **Precios de ejemplo**: mientras `esEjemplo` sea `true` en `precios.json`, no se muestran como definitivos
  (mostrar un aviso interno o bloquear el checkout) hasta cargar los precios reales.
- Botones: primario = `azul` con texto blanco; secundario = borde y texto `azul`; sobre fondos azules, `ambar` (CTA) y `claro` (contorno).
- Estados de foco visibles (ya definidos globalmente) y `prefers-reduced-motion` respetado.

## 6. Qué evitar

- Gradientes llamativos, neón, fondos oscuros, íconos de patitas en cada rincón.
- Textos en mayúsculas sostenidas (salvo etiquetas cortas), tipografías decorativas, más de 2 familias.
- Texto sobre las fotos de bolsas (ya están cargadas de texto).
- Mostrar en pantalla los precios escritos a mano que aparecen en algunas fotos (ver lista en el reporte de Fase 1).

## 7. Datos que consume el diseño

- `src/data/productos.json` — catálogo (sin precio). Se regenera con `npm run catalogo`.
- `src/data/precios.json` — `{ [id]: { precio, stock, esEjemplo } }`. Se completa con `npm run precios` (solo agrega ids nuevos).
- Imágenes WebP (máx. 1200 px de ancho): `public/productos/[marca]/[id].webp`, ruta ya incluida en el campo `imagen`.

## 8. Encabezado y portada animada (2026-10-28)

- **Encabezado en pestañas** (`src/components/layout/Header.jsx`): dos pestañas crema. Izquierda: píldora con el gato, nombre en
  mayúsculas espaciadas y los 7 enlaces. Derecha: lupa (abre el buscador), carrito con contador e "Ingresar". No es fijo: se va con la página.
  En Inicio flota sobre la portada y el video asoma entre las pestañas; en las demás páginas va en el flujo, sobre el fondo crema.
  Por debajo de `lg` es una barra con menú, nombre y carrito; el menú trae enlaces, buscador e ingreso.
- **Ingreso con WhatsApp** (`/ingresar`): sin contraseñas ni cuentas. Pide nombre y celular, valida y abre WhatsApp con el mensaje escrito.
  No guarda nada. La página es `noindex`.
- **Portada animada** (`src/components/portada/Portada.jsx`): el scroll recorre un video fijo (Bruno → croqueta → plato). Textos, botones,
  videos y tiempos en `src/config/portada.ts`. Con movimiento reducido o ahorro de datos se ven dos tarjetas fijas.
- **Colores nuevos**, solo para la portada y el encabezado: `cielo` #0A90E8 (círculos, botón de ingreso, fondo de la portada) y `tinta` #06152F
  (texto sobre el cielo, 5,3:1). Sobre el cielo: la crema solo sirve en texto grande (3,3:1) y el ámbar nunca como texto (1,9:1).
- **Sin blanco** en la portada ni en el encabezado: se usa el crema `fondo`. Los blancos del video se pasaron a crema al recodificarlo.

- **Crema fuerte en todo el sitio (2026-10-28):** `fondo` pasó de #FFFAF0 a #FBE9C6 y `blanco` dejó de ser blanco: es #FFF6E3, el crema claro de tarjetas, campos y paneles. `durazno` subió a #F4C9A6 para separarse del fondo. No hay blanco en la interfaz.
