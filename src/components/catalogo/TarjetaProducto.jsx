import { Link } from 'react-router-dom';
import ImagenProducto from '../ui/ImagenProducto.jsx';
import Icono from '../ui/Icono.jsx';
import { formatearPrecio } from '../../lib/formato.js';
import { useCarrito } from '../../context/CarritoContext.jsx';

export default function TarjetaProducto({ producto, prioridad = false }) {
  const { agregar } = useCarrito();
  const veterinario = producto.etiquetas.includes('dieta veterinaria');
  const sinPrecio = producto.precio == null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta transition duration-300 focus-within:shadow-elevada hover:shadow-elevada motion-safe:hover:-translate-y-1">
      <div className="relative">
        <ImagenProducto producto={producto} prioridad={prioridad} className="aspect-[4/5]" />
        {(veterinario || !producto.stock) && (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {!producto.stock && <span className="rounded-boton bg-noche px-2.5 py-1 text-xs font-bold text-fondo">Agotado</span>}
            {veterinario && <span className="rounded-boton bg-ambar px-2.5 py-1 text-xs font-bold text-noche">Veterinaria</span>}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
        <p className="text-[0.7rem] font-bold tracking-wider text-noche-suave uppercase">{producto.marca}</p>
        <h3 className="font-display text-base leading-snug font-bold sm:text-lg">
          <Link
            to={`/producto/${producto.id}`}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:text-azul-oscuro focus-visible:after:outline-3 focus-visible:after:outline-azul focus-visible:after:-outline-offset-2 focus-visible:outline-none"
          >
            {producto.nombre}
          </Link>
        </h3>
        <p className="text-sm text-noche-suave">{producto.presentacion}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className={`font-bold tabular-nums ${sinPrecio ? 'text-sm text-noche-suave' : 'text-lg sm:text-xl'}`}>
            {formatearPrecio(producto.precio)}
          </p>
          <button
            type="button"
            onClick={() => agregar(producto.id)}
            disabled={!producto.stock}
            aria-label={`Agregar al carrito: ${producto.marca} ${producto.nombre}, ${producto.presentacion}`}
            className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-azul text-blanco transition-colors hover:bg-azul-oscuro disabled:cursor-not-allowed disabled:bg-durazno-oscuro disabled:text-noche-suave motion-safe:active:scale-95"
          >
            <Icono nombre="mas" className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function TarjetaEsqueleto() {
  return (
    <div className="overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta" aria-hidden="true">
      <div className="esqueleto aspect-[4/5]" />
      <div className="space-y-2 p-4">
        <div className="esqueleto h-3 w-1/3 rounded" />
        <div className="esqueleto h-5 w-4/5 rounded" />
        <div className="esqueleto h-4 w-1/4 rounded" />
      </div>
    </div>
  );
}
