import { Link } from 'react-router-dom';
import { TIENDA } from '../../config/store';

// Logo real (public/logo.webp y logo-2x.webp, generados con `npm run fotos`).
// Su fondo es el azul de marca: en el header se funde con la barra; en el footer queda como sello redondeado.
export function ImagenLogo({ grande = false, className = '' }) {
  return (
    <img
      src={grande ? '/logo-2x.webp' : '/logo.webp'}
      width={grande ? 540 : 270}
      height={grande ? 235 : 118}
      alt={TIENDA.nombre}
      decoding="async"
      className={`block h-auto ${className}`}
    />
  );
}

export default function Logo({ claro = false }) {
  return (
    <Link to="/" className="group inline-block" aria-label={`${TIENDA.nombre}, ir al inicio`}>
      <ImagenLogo
        className={`w-28 transition-transform duration-300 sm:w-36 motion-safe:group-hover:scale-[1.03] ${claro ? 'w-40 rounded-2xl shadow-elevada sm:w-44' : ''}`}
      />
    </Link>
  );
}
