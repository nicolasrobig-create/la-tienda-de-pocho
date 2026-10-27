import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Buscador from './Buscador.jsx';
import Icono from '../ui/Icono.jsx';
import Dialogo from '../ui/Dialogo.jsx';
import { useCarrito } from '../../context/CarritoContext.jsx';
import { TIENDA } from '../../config/store';

const ENLACES = [
  { etiqueta: 'Catálogo', to: '/catalogo', animal: null },
  { etiqueta: 'Gatos', to: '/catalogo?animal=gato', animal: 'gato' },
  { etiqueta: 'Perros', to: '/catalogo?animal=perro', animal: 'perro' },
  { etiqueta: 'Marcas', to: '/#marcas', marcas: true },
  { etiqueta: 'Nosotros', to: '/nosotros' },
  { etiqueta: 'Envíos', to: '/envios-y-devoluciones' },
  { etiqueta: 'Contacto', to: '/contacto' },
];

function useActivo() {
  const { pathname, search, hash } = useLocation();
  const animal = new URLSearchParams(search).get('animal');
  return (e) => {
    if (e.marcas) return pathname === '/' && hash === '#marcas';
    if (e.animal !== undefined) return pathname === '/catalogo' && (animal ?? null) === e.animal;
    return pathname === e.to;
  };
}

function Navegacion({ vertical = false, onNavegar }) {
  const activo = useActivo();
  return (
    <ul className={vertical ? 'flex flex-col' : 'flex items-center gap-1'}>
      {ENLACES.map((e) => (
        <li key={e.etiqueta}>
          <Link
            to={e.to}
            onClick={onNavegar}
            aria-current={activo(e) ? 'page' : undefined}
            className={
              vertical
                ? 'block border-b border-durazno-oscuro/60 py-3.5 font-display text-xl aria-[current=page]:text-azul'
                : 'rounded-boton px-3.5 py-2 text-[0.95rem] font-semibold text-fondo transition-colors hover:bg-fondo/15 aria-[current=page]:bg-ambar aria-[current=page]:text-noche'
            }
          >
            {e.etiqueta}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Header() {
  const { totalUnidades } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sobre-oscuro sticky top-0 z-30 bg-azul shadow-tarjeta">
      <p className="bg-ambar px-4 py-1.5 text-center text-xs font-semibold text-noche sm:text-sm">
        Entregas en {TIENDA.cobertura} · ¿Dudas para elegir? Escríbenos y te ayudamos
      </p>

      <div className="contenedor flex items-center gap-3 py-2.5 lg:gap-6">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="inline-flex size-11 items-center justify-center rounded-full text-fondo transition-colors hover:bg-fondo/15 lg:hidden"
          aria-label="Abrir menú"
          aria-haspopup="dialog"
        >
          <Icono nombre="menu" className="size-6" />
        </button>

        <div className="mr-auto lg:mr-0">
          <Logo />
        </div>

        <Buscador id="buscar-escritorio" className="mx-auto hidden w-full max-w-md lg:block" />

        <Link
          to="/carrito"
          className="relative inline-flex size-11 items-center justify-center rounded-full text-fondo transition-colors hover:bg-fondo/15"
          aria-label={`Carrito, ${totalUnidades} ${totalUnidades === 1 ? 'producto' : 'productos'}`}
        >
          <Icono nombre="carrito" className="size-6" />
          {totalUnidades > 0 && (
            <span
              key={totalUnidades}
              className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-ambar px-1.5 text-xs font-bold text-noche tabular-nums motion-safe:animate-aparecer"
              aria-hidden="true"
            >
              {totalUnidades}
            </span>
          )}
        </Link>
      </div>

      <div className="contenedor pb-3 lg:hidden">
        <Buscador id="buscar-movil" />
      </div>

      <nav aria-label="Principal" className="contenedor hidden border-t border-fondo/15 py-1.5 lg:block">
        <Navegacion />
      </nav>

      <Dialogo abierto={menuAbierto} onCerrar={cerrarMenu} etiqueta="Menú principal">
        <div className="flex h-full flex-col overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <Logo claro />
            <button type="button" onClick={cerrarMenu} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-durazno" aria-label="Cerrar menú">
              <Icono nombre="cerrar" className="size-6" />
            </button>
          </div>
          <nav aria-label="Principal (móvil)">
            <Navegacion vertical onNavegar={cerrarMenu} />
          </nav>
          <div className="mt-auto pt-8 text-sm text-noche-suave">
            <p>Entregamos en {TIENDA.cobertura}.</p>
            <a href={TIENDA.facebook} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 font-semibold text-azul-oscuro underline-offset-4 hover:underline">
              <Icono nombre="facebook" className="size-5" /> Síguenos en Facebook
            </a>
          </div>
        </div>
      </Dialogo>
    </header>
  );
}
