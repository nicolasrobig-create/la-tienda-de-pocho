// Une el catálogo (productos.json, sin precios) con precios.json por id.
// El precio NUNCA se lee de productos.json.
import productosJson from '../data/productos.json';
import preciosJson from '../data/precios.json';

export const productos = productosJson.map((p, i) => {
  const entrada = preciosJson[p.id];
  return {
    ...p,
    orden: i, // posición en el catálogo; "novedades" ordena de mayor a menor
    // /productos/[carpeta]/archivo.webp -> carpeta
    slugMarca: p.imagen ? p.imagen.split('/')[2] : p.marca.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    precio: entrada?.precio ?? null,
    stock: entrada?.stock ?? true,
  };
});

const porId = new Map(productos.map((p) => [p.id, p]));
export const obtenerProducto = (id) => porId.get(id) ?? null;

export const marcas = [
  ...productos
    .reduce((mapa, p) => {
      const m = mapa.get(p.slugMarca) ?? { slug: p.slugMarca, nombre: p.marca, total: 0, animales: new Set() };
      m.total++;
      m.animales.add(p.tipoAnimal);
      return mapa.set(p.slugMarca, m);
    }, new Map())
    .values(),
].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export const obtenerMarca = (slug) => marcas.find((m) => m.slug === slug) ?? null;

// Misma marca + animal + nombre, distinta presentación.
export const variantesDe = (producto) =>
  productos
    .filter((p) => p.marca === producto.marca && p.tipoAnimal === producto.tipoAnimal && p.nombre === producto.nombre)
    .sort((a, b) => a.pesoKg - b.pesoKg);

export const precioPorKg = (p) =>
  p.precio != null && p.pesoKg > 0 ? Math.round(p.precio / p.pesoKg / 100) * 100 : null;

export const etiquetasDestacadas = [
  'gatito', 'cachorro', 'adulto', 'senior', 'esterilizado', 'cuidado urinario', 'cuidado renal',
  'control de peso', 'bolas de pelo', 'salud digestiva', 'sin granos', 'dieta veterinaria',
];

export const rangoPrecios = (() => {
  const v = productos.map((p) => p.precio).filter((x) => x != null);
  return { min: Math.min(...v), max: Math.max(...v) };
})();
