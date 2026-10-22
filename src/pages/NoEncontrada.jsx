import Boton from '../components/ui/Boton.jsx';
import EstadoVacio from '../components/ui/EstadoVacio.jsx';
import { usePagina } from '../hooks/usePagina.js';

export default function NoEncontrada() {
  usePagina({ titulo: 'Página no encontrada', noindex: true });
  return (
    <div className="contenedor py-16">
      <p className="mb-2 text-center font-display text-7xl font-bold text-terracota" aria-hidden="true">404</p>
      <EstadoVacio
        principal
        icono="buscar"
        titulo="Esta página no existe"
        acciones={<><Boton to="/">Ir al inicio</Boton><Boton to="/catalogo" variante="secundario">Ver el catálogo</Boton></>}
      >
        Es posible que el enlace esté mal escrito o que la página se haya movido.
      </EstadoVacio>
    </div>
  );
}
