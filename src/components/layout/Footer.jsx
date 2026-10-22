import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icono from '../ui/Icono.jsx';
import { TIENDA } from '../../config/store';
import { numeroWhatsApp } from '../../lib/pedido.js';

const WHATSAPP = numeroWhatsApp(TIENDA.whatsapp);

const titulo = 'mb-3 font-display text-lg font-bold text-crema';
const enlace = 'text-crema/80 underline-offset-4 transition-colors hover:text-miel hover:underline';

export default function Footer() {
  return (
    <footer className="mt-20 bg-cacao text-crema">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo claro />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-crema/80">
            Alimento y cuidado para gatos y perros, de marcas básicas a dietas veterinarias, con entrega en {TIENDA.cobertura}.
          </p>
        </div>

        <nav aria-label="Tienda">
          <h2 className={titulo}>Tienda</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className={enlace} to="/catalogo">Todo el catálogo</Link></li>
            <li><Link className={enlace} to="/catalogo?animal=gato">Para gatos</Link></li>
            <li><Link className={enlace} to="/catalogo?animal=perro">Para perros</Link></li>
            <li><Link className={enlace} to="/#marcas">Marcas</Link></li>
            <li><Link className={enlace} to="/carrito">Mi carrito</Link></li>
          </ul>
        </nav>

        <nav aria-label="Ayuda">
          <h2 className={titulo}>Ayuda</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className={enlace} to="/envios-y-devoluciones">Envíos y devoluciones</Link></li>
            <li><Link className={enlace} to="/nosotros">Sobre nosotros</Link></li>
            <li><Link className={enlace} to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className={titulo}>Encuéntranos</h2>
          <ul className="space-y-3 text-sm text-crema/80">
            <li className="flex gap-2.5">
              <Icono nombre="pin" className="mt-0.5 size-5 shrink-0 text-miel" />
              <span>
                Zona de cobertura: <strong className="font-semibold text-crema">{TIENDA.cobertura}</strong>
                {TIENDA.direccion && <><br />{TIENDA.direccion}</>}
              </span>
            </li>
            {TIENDA.horario && (
              <li className="flex gap-2.5"><Icono nombre="reloj" className="mt-0.5 size-5 shrink-0 text-miel" /><span>{TIENDA.horario}</span></li>
            )}
            {WHATSAPP && (
              <li className="flex gap-2.5">
                <Icono nombre="whatsapp" className="mt-0.5 size-5 shrink-0 text-miel" />
                <a className={enlace} href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
            )}
            {TIENDA.telefono && (
              <li className="flex gap-2.5"><Icono nombre="whatsapp" className="mt-0.5 size-5 shrink-0 text-miel" /><a className={enlace} href={`tel:${TIENDA.telefono.replace(/\s/g, '')}`}>{TIENDA.telefono}</a></li>
            )}
            {TIENDA.email && (
              <li className="flex gap-2.5"><Icono nombre="correo" className="mt-0.5 size-5 shrink-0 text-miel" /><a className={enlace} href={`mailto:${TIENDA.email}`}>{TIENDA.email}</a></li>
            )}
            <li className="flex gap-2.5">
              <Icono nombre="facebook" className="mt-0.5 size-5 shrink-0 text-miel" />
              <a className={enlace} href={TIENDA.facebook} target="_blank" rel="noopener noreferrer">
                Facebook · La Tienda de Pocho<span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-crema/15">
        <p className="contenedor py-5 text-xs text-crema/70">
          © {new Date().getFullYear()} {TIENDA.nombre}. Los alimentos veterinarios deben usarse bajo supervisión de un veterinario.
        </p>
      </div>
    </footer>
  );
}
