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

## 2. Paleta cálida

Definida como tokens en `@theme` (`src/index.css`). Contrastes medidos (WCAG, mínimo AA = 4,5:1):

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `crema` | `#FBF4E8` | Fondo de página | — |
| `arena` | `#F1E3CC` | Tarjetas, bandas, superficies | — |
| `arena-oscura` | `#E2CFAE` | Bordes y divisores | — |
| `cacao` | `#3B2418` | Texto principal | 13,2:1 sobre crema |
| `cacao-suave` | `#6B5648` | Texto secundario | 6,3:1 sobre crema · 5,4:1 sobre arena |
| `terracota` | `#B5452F` | Botón principal, enlaces | blanco sobre terracota 5,4:1 |
| `terracota-oscura` | `#983722` | Hover / activo | blanco sobre ella 7,2:1 |
| `miel` | `#E9A23B` | Acento decorativo, badges, estrellas | cacao sobre miel 6,7:1 |
| `oliva` | `#4F6B2E` | "Disponible", confirmaciones | blanco sobre oliva 6,0:1 |

Reglas:
- Fondo siempre `crema`; las tarjetas suben a `arena` o `blanco` con `--shadow-tarjeta`.
- **Un solo color de acción**: `terracota`. `miel` no se usa como color de texto sobre fondos claros (no pasa AA).
- Nunca negro puro ni gris frío: todos los neutros salen de `cacao`.
- No comunicar estado solo con color (stock/sin stock llevan texto o ícono).
- Las fotos de producto son fotos reales de bolsas con fondos variados: mostrarlas sobre `blanco` o `arena`
  con `object-fit: contain` y esquinas redondeadas, sin recortar la bolsa.

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

- **Tarjeta de producto**: foto en proporción 4:5 sobre `blanco`, marca en `cacao-suave` (mayúsculas pequeñas),
  nombre en `font-display`, presentación como chip, precio grande, botón "Agregar".
- **Filtros**: por animal (gatos/perros), marca, etapa (gatito/adulto/senior) y necesidad
  (urinario, control de peso, bolas de pelo…) usando las `etiquetas` del catálogo.
- **Productos veterinarios** (etiqueta `dieta veterinaria`): aviso visible en la tarjeta y la ficha.
- **Precios de ejemplo**: mientras `esEjemplo` sea `true` en `precios.json`, no se muestran como definitivos
  (mostrar un aviso interno o bloquear el checkout) hasta cargar los precios reales.
- Botones: primario = `terracota` con texto blanco; secundario = borde `cacao` sobre `crema`.
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
