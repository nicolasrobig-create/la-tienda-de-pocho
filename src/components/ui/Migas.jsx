import { Link } from 'react-router-dom';

// items: [{ etiqueta, to? }]. El último es la página actual.
export default function Migas({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="text-sm text-cacao-suave">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => {
          const ultimo = i === items.length - 1;
          return (
            <li key={it.etiqueta} className="flex items-center gap-2">
              {ultimo || !it.to ? (
                <span aria-current={ultimo ? 'page' : undefined} className={ultimo ? 'font-semibold text-cacao' : ''}>{it.etiqueta}</span>
              ) : (
                <Link to={it.to} className="underline-offset-4 hover:text-terracota hover:underline">{it.etiqueta}</Link>
              )}
              {!ultimo && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
