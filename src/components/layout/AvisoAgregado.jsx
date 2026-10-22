import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icono from '../ui/Icono.jsx';
import { useCarrito } from '../../context/CarritoContext.jsx';

// Aviso emergente tras agregar un producto. La región aria-live existe siempre,
// para que los lectores de pantalla anuncien el cambio.
export default function AvisoAgregado() {
  const { aviso, cerrarAviso } = useCarrito();

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(cerrarAviso, 4500);
    return () => clearTimeout(t);
  }, [aviso, cerrarAviso]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {aviso && (
        <div
          key={aviso.clave}
          className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-cacao p-3 pr-4 text-crema shadow-elevada motion-safe:animate-subir"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-oliva text-blanco">
            <Icono nombre="check" className="size-5" />
          </span>
          <p className="min-w-0 flex-1 text-sm leading-snug">
            <span className="block truncate font-semibold">Agregado al carrito</span>
            <span className="block truncate text-crema/80">
              {aviso.cantidad > 1 ? `${aviso.cantidad} × ` : ''}{aviso.producto.nombre} · {aviso.producto.presentacion}
            </span>
          </p>
          <Link to="/carrito" onClick={cerrarAviso} className="shrink-0 rounded-boton bg-crema px-3.5 py-2 text-sm font-semibold text-cacao hover:bg-miel">
            Ver carrito
          </Link>
        </div>
      )}
    </div>
  );
}
