// Filtros del catálogo. Viven en la URL (?q=&animal=&marca=&min=&max=&pres=&et=&orden=)
// para poder compartir el enlace y volver atrás sin perder la búsqueda.
import { normalizar } from './formato.js';

export const ANIMALES = [
  { valor: 'gato', etiqueta: 'Gatos', tipo: 'felino' },
  { valor: 'perro', etiqueta: 'Perros', tipo: 'canino' },
];

export const PRESENTACIONES = [
  { valor: 'hasta-1', etiqueta: 'Hasta 1 kg', ok: (kg) => kg <= 1 },
  { valor: '1-2', etiqueta: 'De 1 a 2 kg', ok: (kg) => kg > 1 && kg <= 2 },
  { valor: '2-5', etiqueta: 'De 2 a 5 kg', ok: (kg) => kg > 2 && kg <= 5 },
  { valor: 'mas-5', etiqueta: 'Más de 5 kg', ok: (kg) => kg > 5 },
];

export const ORDENES = [
  { valor: 'novedades', etiqueta: 'Novedades' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'nombre', etiqueta: 'Nombre (A–Z)' },
];

const lista = (params, clave) => params.getAll(clave).flatMap((v) => v.split(',')).filter(Boolean);
const entero = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

export function leerFiltros(params, marcaFija) {
  const orden = params.get('orden');
  return {
    q: params.get('q') ?? '',
    animal: ANIMALES.some((a) => a.valor === params.get('animal')) ? params.get('animal') : '',
    marcas: marcaFija ? [marcaFija] : lista(params, 'marca'),
    min: entero(params.get('min')),
    max: entero(params.get('max')),
    pres: lista(params, 'pres').filter((v) => PRESENTACIONES.some((p) => p.valor === v)),
    et: lista(params, 'et'),
    orden: ORDENES.some((o) => o.valor === orden) ? orden : 'novedades',
  };
}

// Devuelve nuevos params con los cambios aplicados (valor vacío, null o [] borra la clave).
export function aplicarCambios(params, cambios) {
  const nuevos = new URLSearchParams(params);
  for (const [clave, valor] of Object.entries(cambios)) {
    nuevos.delete(clave);
    if (Array.isArray(valor)) valor.forEach((v) => nuevos.append(clave, v));
    else if (valor !== '' && valor != null) nuevos.set(clave, String(valor));
  }
  return nuevos;
}

// `ignorar` permite contar facetas: por ejemplo, ignorar 'marcas' para saber cuántos
// productos tendría cada marca con el resto de filtros aplicados.
export function filtrar(items, f, { ignorar = [] } = {}) {
  const tokens = ignorar.includes('q') ? [] : normalizar(f.q).split(/\s+/).filter(Boolean);
  const tipo = f.animal ? ANIMALES.find((a) => a.valor === f.animal).tipo : null;
  return items.filter((p) => {
    if (tokens.length) {
      const pajar = normalizar(`${p.marca} ${p.nombre} ${p.presentacion} ${p.etiquetas.join(' ')}`);
      if (!tokens.every((t) => pajar.includes(t))) return false;
    }
    if (!ignorar.includes('animal') && tipo && p.tipoAnimal !== tipo) return false;
    if (!ignorar.includes('marcas') && f.marcas.length && !f.marcas.includes(p.slugMarca)) return false;
    if (!ignorar.includes('precio') && (f.min != null || f.max != null)) {
      if (p.precio == null) return false;
      if (f.min != null && p.precio < f.min) return false;
      if (f.max != null && p.precio > f.max) return false;
    }
    if (!ignorar.includes('pres') && f.pres.length && !f.pres.some((v) => PRESENTACIONES.find((x) => x.valor === v).ok(p.pesoKg))) return false;
    if (!ignorar.includes('et') && f.et.length && !f.et.every((t) => p.etiquetas.includes(t))) return false;
    return true;
  });
}

export function ordenar(items, orden) {
  const copia = [...items];
  const precio = (p, vacio) => p.precio ?? vacio; // sin precio, siempre al final
  switch (orden) {
    case 'precio-asc': return copia.sort((a, b) => precio(a, Infinity) - precio(b, Infinity));
    case 'precio-desc': return copia.sort((a, b) => precio(b, -Infinity) - precio(a, -Infinity));
    case 'nombre':
      return copia.sort((a, b) => `${a.nombre} ${a.marca}`.localeCompare(`${b.nombre} ${b.marca}`, 'es') || a.pesoKg - b.pesoKg);
    default: return copia.sort((a, b) => b.orden - a.orden);
  }
}

export const hayFiltros = (f, marcaFija) =>
  Boolean(f.q || f.animal || (!marcaFija && f.marcas.length) || f.min != null || f.max != null || f.pres.length || f.et.length);
