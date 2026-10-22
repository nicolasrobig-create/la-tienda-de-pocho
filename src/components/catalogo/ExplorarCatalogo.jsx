import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PanelFiltros from './PanelFiltros.jsx';
import TarjetaProducto from './TarjetaProducto.jsx';
import Dialogo from '../ui/Dialogo.jsx';
import Icono from '../ui/Icono.jsx';
import Boton from '../ui/Boton.jsx';
import EstadoVacio from '../ui/EstadoVacio.jsx';
import { productos, marcas, etiquetasDestacadas } from '../../lib/datos.js';
import { ANIMALES, ORDENES, PRESENTACIONES, aplicarCambios, filtrar, hayFiltros, leerFiltros, ordenar } from '../../lib/filtros.js';
import { formatearPrecio, pluralizar } from '../../lib/formato.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

// Tanda de productos: en móvil son menos para no descargar decenas de fotos de golpe (rendimiento).
const POR_PAGINA = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 768px)').matches ? 24 : 12;

// Los productos que la marca fija ya limita no necesitan el filtro de marca.
export default function ExplorarCatalogo({ marcaFija }) {
  const [params, setParams] = useSearchParams();
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const esEscritorio = useMediaQuery('(min-width: 1024px)');

  const f = useMemo(() => leerFiltros(params, marcaFija), [params, marcaFija]);
  const base = useMemo(() => (marcaFija ? productos.filter((p) => p.slugMarca === marcaFija) : productos), [marcaFija]);
  const resultados = useMemo(() => ordenar(filtrar(base, f), f.orden), [base, f]);
  const activos = hayFiltros(f, marcaFija);

  // Cada cambio de filtros vuelve a la primera página de resultados.
  const clave = params.toString();
  useEffect(() => setVisibles(POR_PAGINA), [clave]);

  // Conteos por faceta: cada grupo ignora su propio filtro para mostrar qué pasaría al marcarlo.
  // Solo se calculan cuando el panel está a la vista (columna fija en pantallas anchas o panel abierto en móvil).
  const panelVisible = esEscritorio || panelAbierto;
  const conteos = useMemo(() => {
    if (!panelVisible) return null;
    const contar = (ignorar, clavePorProducto) => {
      const acc = {};
      for (const p of filtrar(base, f, { ignorar })) for (const k of [].concat(clavePorProducto(p))) acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    };
    const et = {};
    for (const t of etiquetasDestacadas) {
      et[t] = f.et.includes(t) ? filtrar(base, f).length : filtrar(base, { ...f, et: [...f.et, t] }).length;
    }
    return {
      animal: contar(['animal'], (p) => (p.tipoAnimal === 'felino' ? 'gato' : 'perro')),
      marcas: contar(['marcas'], (p) => p.slugMarca),
      pres: contar(['pres'], (p) => PRESENTACIONES.filter((x) => x.ok(p.pesoKg)).map((x) => x.valor)),
      et,
    };
  }, [base, f, panelVisible]);

  const etiquetasVisibles = conteos ? etiquetasDestacadas.filter((t) => conteos.et[t] > 0 || f.et.includes(t)) : [];

  const cambiar = (cambios) => setParams((prev) => aplicarCambios(prev, cambios), { replace: true });
  const limpiar = () => setParams(marcaFija ? new URLSearchParams() : new URLSearchParams(), { replace: true });

  // Chips de filtros activos, cada uno con su forma de quitarse.
  const chips = [];
  if (f.q) chips.push({ k: 'q', texto: `Búsqueda: “${f.q}”`, quitar: () => cambiar({ q: '' }) });
  if (f.animal) chips.push({ k: 'animal', texto: ANIMALES.find((a) => a.valor === f.animal).etiqueta, quitar: () => cambiar({ animal: '' }) });
  if (!marcaFija) for (const s of f.marcas) chips.push({ k: `m-${s}`, texto: marcas.find((m) => m.slug === s)?.nombre ?? s, quitar: () => cambiar({ marca: f.marcas.filter((x) => x !== s) }) });
  if (f.min != null || f.max != null) {
    const txt = f.min != null && f.max != null ? `${formatearPrecio(f.min)} – ${formatearPrecio(f.max)}` : f.min != null ? `Desde ${formatearPrecio(f.min)}` : `Hasta ${formatearPrecio(f.max)}`;
    chips.push({ k: 'precio', texto: txt, quitar: () => cambiar({ min: null, max: null }) });
  }
  for (const v of f.pres) chips.push({ k: `p-${v}`, texto: PRESENTACIONES.find((p) => p.valor === v).etiqueta, quitar: () => cambiar({ pres: f.pres.filter((x) => x !== v) }) });
  for (const t of f.et) chips.push({ k: `e-${t}`, texto: t.charAt(0).toUpperCase() + t.slice(1), quitar: () => cambiar({ et: f.et.filter((x) => x !== t) }) });

  const panel = (idBase) => conteos && (
    <PanelFiltros idBase={idBase} f={f} onCambiar={cambiar} marcaFija={marcaFija} conteos={conteos}
      etiquetasVisibles={etiquetasVisibles} onLimpiar={limpiar} hayFiltros={activos} />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
      {esEscritorio && (
        <aside aria-label="Filtros">
          <div className="sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-tarjeta bg-arena/60 p-5">{panel('d')}</div>
        </aside>
      )}

      <section aria-label="Resultados">
        <h2 className="sr-only">Resultados</h2>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPanelAbierto(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-boton border-2 border-cacao px-4 text-sm font-semibold hover:bg-arena lg:hidden"
            aria-haspopup="dialog"
          >
            <Icono nombre="filtro" className="size-5" />
            Filtros
            {chips.length > 0 && <span className="rounded-full bg-terracota px-2 text-xs text-blanco">{chips.length}</span>}
          </button>

          <p role="status" className="mr-auto text-sm text-cacao-suave">
            <strong className="text-cacao">{pluralizar(resultados.length, 'producto', 'productos')}</strong>
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="orden" className="text-sm font-semibold">Ordenar</label>
            <select
              id="orden"
              value={f.orden}
              onChange={(e) => cambiar({ orden: e.target.value === 'novedades' ? '' : e.target.value })}
              className="min-h-11 rounded-xl border border-arena-oscura bg-blanco px-3 text-sm font-medium hover:border-cacao-suave"
            >
              {ORDENES.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Filtros activos">
            {chips.map((c) => (
              <li key={c.k}>
                <button type="button" onClick={c.quitar} className="inline-flex min-h-9 items-center gap-1.5 rounded-boton bg-arena px-3 text-sm font-medium hover:bg-arena-oscura">
                  {c.texto}
                  <Icono nombre="cerrar" className="size-3.5" />
                  <span className="sr-only">Quitar filtro</span>
                </button>
              </li>
            ))}
            <li><Boton variante="fantasma" onClick={limpiar} className="min-h-9 text-sm">Limpiar todo</Boton></li>
          </ul>
        )}

        {resultados.length === 0 ? (
          <EstadoVacio icono="buscar" titulo="No encontramos productos"
            acciones={activos ? <Boton onClick={limpiar}>Quitar los filtros</Boton> : null}>
            Prueba con otra palabra, revisa la ortografía o quita algún filtro. Si buscas algo en especial, escríbenos y lo consultamos.
          </EstadoVacio>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5">
              {resultados.slice(0, visibles).map((p, i) => (
                <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>
              ))}
            </ul>
            {visibles < resultados.length && (
              <div className="mt-8 text-center">
                <Boton variante="secundario" onClick={() => setVisibles((v) => v + POR_PAGINA)}>
                  Mostrar más ({resultados.length - visibles} restantes)
                </Boton>
              </div>
            )}
          </>
        )}
      </section>

      <Dialogo abierto={panelAbierto} onCerrar={() => setPanelAbierto(false)} etiqueta="Filtros">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-arena-oscura px-5 py-4">
            <h2 className="text-2xl">Filtros</h2>
            <button type="button" onClick={() => setPanelAbierto(false)} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-arena" aria-label="Cerrar filtros">
              <Icono nombre="cerrar" className="size-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{panel('m')}</div>
          <div className="border-t border-arena-oscura p-4">
            <Boton onClick={() => setPanelAbierto(false)} className="w-full">Ver {pluralizar(resultados.length, 'producto', 'productos')}</Boton>
          </div>
        </div>
      </Dialogo>
    </div>
  );
}
