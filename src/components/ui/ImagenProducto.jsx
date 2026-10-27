import { useEffect, useRef, useState } from 'react';
import Icono from './Icono.jsx';

// Foto con marcador de carga y respaldo si el archivo falla. Reserva el espacio (sin saltos de layout).
// /productos/x/id.webp -> 240w, 400w, 800w y la original de 1200w (ver scripts/generar-catalogo.js).
const srcSet = (url) => {
  const v = (ancho) => url.replace(/\.webp$/, `-${ancho}.webp ${ancho}w`);
  return `${v(240)}, ${v(400)}, ${v(800)}, ${url} 1200w`;
};

// Tamaños típicos: tarjeta en grilla (~50 % del ancho en móvil, ~280 px en escritorio).
const SIZES_TARJETA = '(min-width: 1024px) 280px, (min-width: 768px) 30vw, 50vw';

export default function ImagenProducto({ producto, className = '', prioridad = false, ajuste = 'contain', sizes = SIZES_TARJETA }) {
  const [cargada, setCargada] = useState(false);
  const [fallo, setFallo] = useState(false);
  const ref = useRef(null);

  // Si la imagen ya estaba en caché, onLoad pudo dispararse antes de enlazar el manejador.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setCargada(true);
  }, []);

  const alt = `${producto.marca} ${producto.nombre}, bolsa de ${producto.presentacion}`;

  return (
    <div className={`relative overflow-hidden bg-blanco ${className}`}>
      {!cargada && !fallo && !prioridad && <div className="esqueleto absolute inset-0" aria-hidden="true" />}
      {fallo || !producto.imagen ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-durazno p-4 text-center text-sm text-noche-suave">
          <Icono nombre="caja" className="size-8" />
          <span>Foto no disponible</span>
        </div>
      ) : (
        <img
          ref={ref}
          src={producto.imagen}
          srcSet={srcSet(producto.imagen)}
          sizes={sizes}
          fetchPriority={prioridad ? 'high' : undefined}
          alt={alt}
          loading={prioridad ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setCargada(true)}
          onError={() => setFallo(true)}
          className={`absolute inset-0 size-full ${ajuste === 'cover' ? 'object-cover' : 'object-contain'} ${prioridad ? '' : `transition-opacity duration-500 ${cargada ? 'opacity-100' : 'opacity-0'}`}`}
        />
      )}
    </div>
  );
}
