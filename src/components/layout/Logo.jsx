import { Link } from 'react-router-dom';
import { TIENDA } from '../../config/store';

// Marca provisional: plato de comida sobre sello terracota + nombre en Fraunces.
// Reemplazar por el logo real cuando exista (solo este archivo).
export function Marca({ className = 'size-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill="var(--color-terracota)" />
      <circle cx="18.5" cy="17" r="2.6" fill="var(--color-miel)" />
      <circle cx="25" cy="14.5" r="2.6" fill="var(--color-miel)" />
      <circle cx="30.5" cy="18" r="2.6" fill="var(--color-miel)" />
      <path d="M11 24h26a13 13 0 0 1-26 0z" fill="var(--color-crema)" />
      <path d="M17 36.5h14" stroke="var(--color-crema)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ claro = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label={`${TIENDA.nombre}, ir al inicio`}>
      <Marca className="size-10 shrink-0 transition-transform duration-300 motion-safe:group-hover:-rotate-6" />
      <span className={`font-display text-xl leading-none font-bold tracking-tight sm:text-2xl ${claro ? 'text-crema' : 'text-cacao'}`}>
        La Tienda <span className="block text-sm font-medium tracking-wide sm:inline sm:text-2xl sm:font-bold">de Pocho</span>
      </span>
    </Link>
  );
}
