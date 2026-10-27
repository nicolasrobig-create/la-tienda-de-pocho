import { useState } from 'react';
import ImagenProducto from '../ui/ImagenProducto.jsx';
import Dialogo from '../ui/Dialogo.jsx';
import Icono from '../ui/Icono.jsx';

// Foto principal con ampliación en un diálogo (teclado: Enter para abrir, Esc para cerrar).
export default function GaleriaProducto({ producto }) {
  const [ampliada, setAmpliada] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta"
        aria-label={`Ampliar foto de ${producto.nombre}`}
        aria-haspopup="dialog"
      >
        <ImagenProducto producto={producto} prioridad sizes="(min-width: 768px) 540px, 92vw" className="aspect-[4/5]" />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-boton bg-noche/85 px-3 py-1.5 text-xs font-semibold text-fondo transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          <Icono nombre="zoom" className="size-4" /> Ampliar
        </span>
      </button>

      <Dialogo abierto={ampliada} onCerrar={() => setAmpliada(false)} etiqueta={`Foto ampliada: ${producto.nombre}`} variante="centro">
        <div className="relative rounded-tarjeta bg-blanco p-2 sm:p-4">
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            className="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-noche text-fondo hover:bg-azul"
            aria-label="Cerrar foto"
          >
            <Icono nombre="cerrar" className="size-6" />
          </button>
          <img
            src={producto.imagen}
            alt={`${producto.marca} ${producto.nombre}, bolsa de ${producto.presentacion}`}
            className="mx-auto max-h-[86dvh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      </Dialogo>
    </div>
  );
}
