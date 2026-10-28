import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Buscador from './Buscador.jsx';
import Boton from '../ui/Boton.jsx';
import Icono from '../ui/Icono.jsx';
import Dialogo from '../ui/Dialogo.jsx';
import { useCarrito } from '../../context/CarritoContext.jsx';
import { TIENDA } from '../../config/store';

// Encabezado en dos pestañas crema (ver docs/brief-diseno.md). No es fijo: se mueve con la página.
// - En Inicio flota sobre la portada animada y el video asoma entre las dos pestañas.
// - En el resto de páginas va en el flujo normal, sobre el fondo crema.
// - Desde lg: pestaña izquierda (logo, nombre y enlaces) y derecha (buscar, carrito, ingresar).
//   Por debajo de lg: barra con menú, nombre y carrito; el menú trae enlaces, buscador e ingreso.

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
    <ul className={vertical ? 'flex flex-col' : 'flex items-center gap-0.5'}>
      {ENLACES.map((e) => (
        <li key={e.etiqueta}>
          <Link
            to={e.to}
            onClick={onNavegar}
            aria-current={activo(e) ? 'page' : undefined}
            className={
              vertical
                ? 'block border-b border-durazno-oscuro/60 py-3.5 font-display text-xl aria-[current=page]:text-azul'
                : 'rounded-boton px-3 py-1.5 text-[0.9rem] font-semibold text-tinta transition-colors hover:bg-durazno aria-[current=page]:bg-tinta aria-[current=page]:text-fondo'
            }
          >
            {e.etiqueta}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Círculo de acción: cielo con ícono oscuro. El anillo crema lo separa del video cuando queda encima.
const CIRCULO =
  'relative inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-cielo text-tinta ring-[0.35rem] ring-fondo transition duration-200 hover:bg-tinta hover:text-fondo motion-safe:hover:-translate-y-0.5';

function Carrito() {
  const { totalUnidades } = useCarrito();
  return (
    <Link to="/carrito" className={CIRCULO} aria-label={`Carrito, ${totalUnidades} ${totalUnidades === 1 ? 'producto' : 'productos'}`}>
      <Icono nombre="carrito" className="size-5" />
      {totalUnidades > 0 && (
        <span
          key={totalUnidades}
          className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-ambar px-1.5 text-xs font-bold text-noche tabular-nums ring-2 ring-fondo motion-safe:animate-aparecer"
          aria-hidden="true"
        >
          {totalUnidades}
        </span>
      )}
    </Link>
  );
}

function MarcaYNombre() {
  return (
    <Link to="/" aria-label={`${TIENDA.nombre}, ir al inicio`} className="group flex items-center gap-5">
      {/* El ícono del gato tiene exactamente el azul de la marca: se funde con la píldora */}
      <span className="inline-flex h-12 w-[4.5rem] items-center justify-center rounded-boton bg-azul transition-transform duration-300 motion-safe:group-hover:scale-[1.04]">
        <img src="/marca-gato-96.webp" width={96} height={96} alt="" decoding="async" className="size-11" />
      </span>
      <span className="text-sm font-bold tracking-[0.38em] whitespace-nowrap text-tinta uppercase">La Tienda de Pocho</span>
    </Link>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const enInicio = pathname === '/';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);
  const cerrarBuscador = () => setBuscando(false);

  return (
    <header
      className={`z-30 [--marco:0.5rem] md:[--marco:0.75rem] ${
        enInicio ? 'absolute inset-x-0 top-0' : 'relative border-b border-durazno-oscuro/40'
      }`}
    >
      {/* Escritorio: dos pestañas */}
      <div className={`${enInicio ? '' : 'contenedor'} hidden items-start justify-between lg:flex`}>
        <div className="pestana pestana-izq relative rounded-br-[1.75rem] bg-fondo pt-3 pr-8 pb-3 pl-3">
          <MarcaYNombre />
          <nav aria-label="Principal" className="mt-2.5">
            <Navegacion />
          </nav>
        </div>

        <div className="pestana pestana-der relative flex items-center gap-3 rounded-bl-[1.75rem] bg-fondo pt-3 pr-3 pb-3 pl-8">
          <button type="button" onClick={() => setBuscando(true)} className={CIRCULO} aria-label="Abrir buscador" aria-haspopup="dialog">
            <Icono nombre="buscar" className="size-5" />
          </button>
          <Carrito />
          <Link
            to="/ingresar"
            className="inline-flex h-11 items-center gap-2 rounded-boton bg-cielo px-5 font-bold text-tinta transition duration-200 hover:bg-tinta hover:text-fondo motion-safe:hover:-translate-y-0.5"
          >
            <Icono nombre="whatsapp" className="size-5" /> Ingresar
          </Link>
        </div>
      </div>

      {/* Móvil y tableta: menú, nombre y carrito */}
      <div className={`${enInicio ? 'px-4 pt-4' : 'contenedor py-3'} flex items-center justify-between gap-2 lg:hidden`}>
        <button type="button" onClick={() => setMenuAbierto(true)} className={CIRCULO} aria-label="Abrir menú" aria-haspopup="dialog">
          <Icono nombre="menu" className="size-5" />
        </button>
        <Link
          to="/"
          aria-label={`${TIENDA.nombre}, ir al inicio`}
          className="rounded-boton bg-fondo px-4 py-2 text-[0.68rem] font-bold tracking-[0.28em] whitespace-nowrap text-tinta uppercase shadow-tarjeta sm:text-xs"
        >
          La Tienda de Pocho
        </Link>
        <Carrito />
      </div>

      <Dialogo abierto={buscando} onCerrar={cerrarBuscador} etiqueta="Buscar productos" variante="centro">
        <div className="mx-auto w-full max-w-xl rounded-tarjeta bg-fondo p-5 shadow-elevada">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-xl font-bold">¿Qué buscas?</p>
            <button type="button" onClick={cerrarBuscador} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-durazno" aria-label="Cerrar buscador">
              <Icono nombre="cerrar" className="size-6" />
            </button>
          </div>
          <Buscador id="buscar-escritorio" onBuscar={cerrarBuscador} />
        </div>
      </Dialogo>

      <Dialogo abierto={menuAbierto} onCerrar={cerrarMenu} etiqueta="Menú principal">
        <div className="flex h-full flex-col overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <Logo claro />
            <button type="button" onClick={cerrarMenu} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-durazno" aria-label="Cerrar menú">
              <Icono nombre="cerrar" className="size-6" />
            </button>
          </div>
          <Buscador id="buscar-movil" onBuscar={cerrarMenu} className="mb-4" />
          <nav aria-label="Principal (móvil)">
            <Navegacion vertical onNavegar={cerrarMenu} />
          </nav>
          <Boton to="/ingresar" onClick={cerrarMenu} className="mt-6 min-h-12 w-full"><Icono nombre="whatsapp" className="size-5" /> Ingresar con WhatsApp</Boton>
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
