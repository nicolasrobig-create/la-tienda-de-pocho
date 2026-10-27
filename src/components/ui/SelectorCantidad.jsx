import Icono from './Icono.jsx';
import { CANTIDAD_MAX } from '../../context/CarritoContext.jsx';

export default function SelectorCantidad({ valor, onCambiar, etiqueta = 'Cantidad', compacto = false }) {
  const lado = compacto ? 'size-9' : 'size-11';
  const boton =
    `${lado} inline-flex items-center justify-center rounded-boton text-noche transition-colors hover:bg-durazno-oscuro ` +
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <div role="group" aria-label={etiqueta} className="inline-flex items-center rounded-boton border border-durazno-oscuro bg-blanco">
      <button type="button" className={boton} onClick={() => onCambiar(valor - 1)} disabled={valor <= 1} aria-label="Una unidad menos">
        <Icono nombre="menos" className="size-4" />
      </button>
      <output aria-live="polite" className={`min-w-8 text-center font-semibold tabular-nums ${compacto ? 'text-sm' : 'text-base'}`}>
        {valor}
      </output>
      <button type="button" className={boton} onClick={() => onCambiar(valor + 1)} disabled={valor >= CANTIDAD_MAX} aria-label="Una unidad más">
        <Icono nombre="mas" className="size-4" />
      </button>
    </div>
  );
}
