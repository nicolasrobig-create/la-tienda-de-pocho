import { useState } from 'react';
import { Link } from 'react-router-dom';
import Boton from '../components/ui/Boton.jsx';
import Icono from '../components/ui/Icono.jsx';
import ImagenProducto from '../components/ui/ImagenProducto.jsx';
import SelectorCantidad from '../components/ui/SelectorCantidad.jsx';
import EstadoVacio from '../components/ui/EstadoVacio.jsx';
import Migas from '../components/ui/Migas.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { formatearPrecio, pluralizar } from '../lib/formato.js';
import { TIENDA } from '../config/store';
import { usePagina } from '../hooks/usePagina.js';
import { META_ESTATICAS } from '../lib/seo.js';

function Linea({ linea }) {
  const { cambiarCantidad, quitar } = useCarrito();
  const { producto } = linea;
  const nombre = `${producto.marca} ${producto.nombre}, ${producto.presentacion}`;
  return (
    <li className="flex gap-3 py-5 first:pt-0 sm:gap-4">
      <Link to={`/producto/${producto.id}`} className="shrink-0" aria-hidden="true" tabIndex={-1}>
        <ImagenProducto producto={producto} sizes="96px" className="aspect-[4/5] w-20 rounded-xl border border-durazno-oscuro sm:w-24" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-bold tracking-wider text-noche-suave uppercase">{producto.marca}</p>
          <h2 className="font-display text-lg leading-snug font-bold">
            <Link to={`/producto/${producto.id}`} className="hover:text-azul-oscuro">{producto.nombre}</Link>
          </h2>
          <p className="text-sm text-noche-suave">{producto.presentacion} · {formatearPrecio(producto.precio)}{producto.precio != null && ' c/u'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:justify-end sm:gap-4">
          <SelectorCantidad compacto valor={linea.cantidad} onCambiar={(n) => cambiarCantidad(producto.id, n)} etiqueta={`Cantidad de ${nombre}`} />
          <p className="ml-auto text-right font-bold tabular-nums sm:w-28">{linea.subtotal == null ? <span className="text-sm text-noche-suave">Consultar precio</span> : formatearPrecio(linea.subtotal)}</p>
          <button
            type="button"
            onClick={() => quitar(producto.id)}
            className="inline-flex size-11 items-center justify-center rounded-full text-noche-suave transition-colors hover:bg-durazno hover:text-azul-oscuro"
            aria-label={`Quitar del carrito: ${nombre}`}
          >
            <Icono nombre="papelera" className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Carrito() {
  usePagina(META_ESTATICAS['/carrito']);
  const { lineas, totalUnidades, total, hayPorConsultar, vaciar } = useCarrito();
  const [confirmando, setConfirmando] = useState(false);

  if (lineas.length === 0) {
    return (
      <div className="contenedor py-16">
        <EstadoVacio principal icono="carrito" titulo="Tu carrito está vacío" acciones={<Boton to="/catalogo">Ver el catálogo</Boton>}>
          Cuando agregues productos los verás aquí, con el total de tu pedido.
        </EstadoVacio>
      </div>
    );
  }

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Carrito' }]} />
      <h1 className="mt-4 mb-8 text-4xl sm:text-5xl">Tu carrito</h1>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <section aria-label="Productos en el carrito" className="rounded-tarjeta bg-blanco p-4 shadow-tarjeta sm:p-6">
          <ul className="divide-y divide-durazno-oscuro/70">
            {lineas.map((l) => <Linea key={l.id} linea={l} />)}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-durazno-oscuro/70 pt-4">
            <Link to="/catalogo" className="font-semibold text-azul-oscuro underline-offset-4 hover:underline">← Seguir comprando</Link>
            {confirmando ? (
              <p className="flex flex-wrap items-center gap-2 text-sm" role="alert">
                ¿Vaciar todo el carrito?
                <Boton variante="primario" className="min-h-9 px-4 text-sm" onClick={() => { vaciar(); setConfirmando(false); }}>Sí, vaciar</Boton>
                <Boton variante="suave" className="min-h-9 px-4 text-sm" onClick={() => setConfirmando(false)}>Cancelar</Boton>
              </p>
            ) : (
              <Boton variante="fantasma" className="min-h-9 text-sm text-noche-suave" onClick={() => setConfirmando(true)}>Vaciar carrito</Boton>
            )}
          </div>
        </section>

        <aside aria-labelledby="resumen-titulo" className="rounded-tarjeta bg-durazno p-6 lg:sticky lg:top-36">
          <h2 id="resumen-titulo" className="text-2xl">Resumen</h2>
          <dl className="mt-4 space-y-3 text-[0.95rem]">
            <div className="flex justify-between gap-4"><dt>{pluralizar(totalUnidades, 'producto', 'productos')}</dt><dd className="font-semibold tabular-nums">{formatearPrecio(total)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Envío en {TIENDA.cobertura}</dt><dd className="text-right text-noche-suave">Se coordina al confirmar</dd></div>
            <div className="flex items-baseline justify-between gap-4 border-t border-durazno-oscuro pt-4">
              <dt className="font-display text-lg font-bold">Total</dt>
              <dd className="font-display text-3xl font-bold tabular-nums">{formatearPrecio(total)}</dd>
            </div>
          </dl>
          {hayPorConsultar && (
            <p className="mt-3 flex gap-2 text-sm text-noche-suave" role="note">
              <Icono nombre="info" className="mt-0.5 size-4 shrink-0" />
              El total no incluye los productos con precio por consultar.
            </p>
          )}
          <Boton to="/checkout" className="mt-6 min-h-12 w-full" aria-describedby="checkout-nota">Continuar con el pedido</Boton>
          <p id="checkout-nota" className="mt-2 text-center text-xs text-noche-suave">Confirmas el pedido por WhatsApp: ahí te decimos el costo del envío y la disponibilidad.</p>
        </aside>
      </div>
    </div>
  );
}
