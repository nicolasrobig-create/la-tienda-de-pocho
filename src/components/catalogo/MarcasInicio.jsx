import { Link } from 'react-router-dom';
import Icono from '../ui/Icono.jsx';
import ImagenProducto from '../ui/ImagenProducto.jsx';
import { marcas, productos } from '../../lib/datos.js';

// Marcas de la portada: las que tienen más productos van grandes, con la foto real de una de sus bolsas;
// las demás, como chips con la inicial. Todo se calcula del catálogo: no hay que editar nada al agregar marcas.
const DESTACADAS = 6;
const FONDOS = ['bg-durazno', 'bg-blanco', 'bg-durazno-claro'];

const fotoDe = new Map();
for (const p of productos) if (p.imagen && !fotoDe.has(p.slugMarca)) fotoDe.set(p.slugMarca, p);

const destacadas = [...marcas].sort((a, b) => b.total - a.total).slice(0, DESTACADAS);
const resto = marcas.filter((m) => !destacadas.includes(m)); // `marcas` ya viene en orden alfabético

export default function MarcasInicio() {
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {destacadas.map((m, i) => (
          <li key={m.slug}>
            <Link
              to={`/marca/${m.slug}`}
              className={`elevar flex h-full flex-col gap-3 rounded-[1.5rem] p-3.5 text-tinta shadow-tarjeta md:p-5 ${FONDOS[i % FONDOS.length]}`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-xl leading-tight font-bold md:text-2xl">{m.nombre}</span>
                <span className="shrink-0 rounded-boton bg-fondo px-2.5 py-1 text-xs font-bold tabular-nums">
                  {m.total}<span className="sr-only"> productos</span>
                </span>
              </span>
              {fotoDe.has(m.slug) && (
                <ImagenProducto producto={fotoDe.get(m.slug)} sizes="(min-width: 1024px) 320px, 45vw" className="aspect-[4/3] rounded-2xl" />
              )}
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold">
                Ver productos
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-tinta text-fondo"><Icono nombre="flecha" className="size-4" /></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 mb-4 font-display text-xl font-bold">Todas las demás marcas</h3>
      {/* Móvil: tres filas que se desplazan de lado. Escritorio: todas a la vista. */}
      <ul className="relative -mx-4 grid auto-cols-max grid-flow-col grid-rows-3 gap-2.5 overflow-x-auto px-4 pb-3 md:mx-0 md:flex md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
        {resto.map((m) => (
          <li key={m.slug}>
            <Link
              to={`/marca/${m.slug}`}
              className="elevar group flex items-center gap-2.5 rounded-boton bg-blanco py-1.5 pr-4 pl-1.5 shadow-tarjeta hover:bg-azul hover:text-fondo"
            >
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-cielo font-display text-base font-bold text-tinta">{m.nombre[0]}</span>
              <span className="font-semibold whitespace-nowrap">{m.nombre}</span>
              <span className="text-sm tabular-nums opacity-70">{m.total}<span className="sr-only"> productos</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
