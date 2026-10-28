import { useEffect, useState } from 'react';
import Icono from '../ui/Icono.jsx';
import Boton from '../ui/Boton.jsx';
import Campo from '../ui/Campo.jsx';
import { ANIMALES, PRESENTACIONES } from '../../lib/filtros.js';
import { marcas, rangoPrecios } from '../../lib/datos.js';
import { formatearPrecio } from '../../lib/formato.js';

const alternar = (lista, valor) => (lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);

function Grupo({ titulo, children }) {
  return (
    <fieldset className="mb-5 border-b border-durazno-oscuro/70 pb-5 last:mb-0 last:border-0 last:pb-0">
      <legend className="mb-3 font-display text-lg font-bold">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Casilla({ id, marcada, onCambiar, etiqueta, cantidad }) {
  return (
    <label htmlFor={id} className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-[0.95rem] hover:bg-durazno/70">
      <input id={id} type="checkbox" checked={marcada} onChange={onCambiar} className="size-5 shrink-0 cursor-pointer accent-azul" />
      <span className="flex-1">{etiqueta}</span>
      {cantidad != null && <span className="text-sm text-noche-suave tabular-nums">{cantidad}</span>}
    </label>
  );
}

// f: filtros actuales · onCambiar(cambios) · conteos: { animal, marcas, pres, et }
export default function PanelFiltros({ idBase, f, onCambiar, marcaFija, conteos, etiquetasVisibles, onLimpiar, hayFiltros }) {
  const [min, setMin] = useState(f.min ?? '');
  const [max, setMax] = useState(f.max ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setMin(f.min ?? '');
    setMax(f.max ?? '');
    setError('');
  }, [f.min, f.max]);

  const aplicarPrecio = (e) => {
    e.preventDefault();
    const a = min === '' ? null : Number(min);
    const b = max === '' ? null : Number(max);
    if ((a != null && (!Number.isFinite(a) || a < 0)) || (b != null && (!Number.isFinite(b) || b < 0))) {
      setError('Escribe solo números positivos, sin puntos ni símbolos.');
      return;
    }
    if (a != null && b != null && a > b) {
      setError('El precio mínimo no puede ser mayor que el máximo.');
      return;
    }
    setError('');
    onCambiar({ min: a, max: b });
  };

  return (
    <div>
      <Grupo titulo="Para quién">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Animal">
          {[{ valor: '', etiqueta: 'Todos' }, ...ANIMALES].map((a) => (
            <button
              key={a.valor || 'todos'}
              type="button"
              aria-pressed={f.animal === a.valor}
              onClick={() => onCambiar({ animal: a.valor })}
              className="min-h-11 rounded-boton border-2 border-noche px-4 text-sm font-semibold transition-colors hover:bg-durazno aria-pressed:bg-noche aria-pressed:text-fondo"
            >
              {a.etiqueta}
              {a.valor && <span className="ml-1.5 font-normal opacity-70 tabular-nums">{conteos.animal[a.valor] ?? 0}</span>}
            </button>
          ))}
        </div>
      </Grupo>

      {!marcaFija && (
        <Grupo titulo="Marca">
          <div className="-mr-2 max-h-64 space-y-0.5 overflow-y-auto pr-2">
            {marcas.map((m) => {
              const n = conteos.marcas[m.slug] ?? 0;
              const marcada = f.marcas.includes(m.slug);
              if (n === 0 && !marcada) return null;
              return (
                <Casilla key={m.slug} id={`${idBase}-marca-${m.slug}`} marcada={marcada} etiqueta={m.nombre} cantidad={n}
                  onCambiar={() => onCambiar({ marca: alternar(f.marcas, m.slug) })} />
              );
            })}
          </div>
        </Grupo>
      )}

      <Grupo titulo="Precio (COP)">
        <form onSubmit={aplicarPrecio} noValidate>
          <div className="grid grid-cols-1 gap-3">
            <Campo etiqueta="Mínimo" type="number" inputMode="numeric" min="0" step="500" placeholder={String(rangoPrecios.min)} value={min} onChange={(e) => setMin(e.target.value)} />
            <Campo etiqueta="Máximo" type="number" inputMode="numeric" min="0" step="500" placeholder={String(rangoPrecios.max)} value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-azul-oscuro">
              <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}
          <p className="mt-2 text-xs text-noche-suave">Va de {formatearPrecio(rangoPrecios.min)} a {formatearPrecio(rangoPrecios.max)}.</p>
          <Boton type="submit" variante="suave" className="mt-3 w-full">Aplicar precio</Boton>
        </form>
      </Grupo>

      <Grupo titulo="Presentación">
        <div className="space-y-0.5">
          {PRESENTACIONES.map((p) => (
            <Casilla key={p.valor} id={`${idBase}-pres-${p.valor}`} marcada={f.pres.includes(p.valor)} etiqueta={p.etiqueta}
              cantidad={conteos.pres[p.valor] ?? 0} onCambiar={() => onCambiar({ pres: alternar(f.pres, p.valor) })} />
          ))}
        </div>
      </Grupo>

      {etiquetasVisibles.length > 0 && (
        <Grupo titulo="Necesidad">
          <div className="space-y-0.5">
            {etiquetasVisibles.map((t) => (
              <Casilla key={t} id={`${idBase}-et-${t}`} marcada={f.et.includes(t)} etiqueta={t.charAt(0).toUpperCase() + t.slice(1)}
                cantidad={conteos.et[t] ?? 0} onCambiar={() => onCambiar({ et: alternar(f.et, t) })} />
            ))}
          </div>
        </Grupo>
      )}

      {hayFiltros && (
        <Boton variante="fantasma" onClick={onLimpiar} className="mt-2 w-full">
          Quitar todos los filtros
        </Boton>
      )}
    </div>
  );
}
