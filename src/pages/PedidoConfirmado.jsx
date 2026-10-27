import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Boton from '../components/ui/Boton.jsx';
import Icono from '../components/ui/Icono.jsx';
import EstadoVacio from '../components/ui/EstadoVacio.jsx';
import { TIENDA } from '../config/store';
import { formatearPrecio } from '../lib/formato.js';
import { META_ESTATICAS } from '../lib/seo.js';
import { usePagina } from '../hooks/usePagina.js';

// El pedido llega por el estado de navegación. Como incluye datos personales (nombre, teléfono,
// dirección), se borra del historial del navegador apenas se muestra: queda solo en memoria y, si
// se recarga la página o se vuelve atrás, ya no está.
export default function PedidoConfirmado() {
  usePagina(META_ESTATICAS['/pedido-confirmado']);
  const { state: pedido } = useLocation();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (window.history.state?.usr) window.history.replaceState({ ...window.history.state, usr: null }, '');
  }, []);

  if (!pedido?.codigo) {
    return (
      <div className="contenedor py-16">
        <EstadoVacio principal icono="caja" titulo="No encontramos un pedido reciente" acciones={<Boton to="/catalogo">Ver el catálogo</Boton>}>
          Por privacidad no guardamos tu pedido en el navegador. Si ya lo enviaste por WhatsApp, ahí queda el detalle.
        </EstadoVacio>
      </div>
    );
  }

  const enviado = Boolean(pedido.url);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pedido.mensaje);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="contenedor py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[1.75rem] bg-durazno p-6 text-center sm:p-10 motion-safe:animate-subir">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-oliva text-blanco">
            <Icono nombre="check" className="size-8" />
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl">
            {enviado ? `${pedido.nombre ? `${pedido.nombre}, falta` : 'Falta'} un último paso` : 'Tu pedido quedó armado'}
          </h1>
          <p className="mt-3 text-lg text-noche-suave">
            {enviado
              ? <>Abrimos WhatsApp con tu pedido. <strong className="text-noche">Presiona «Enviar» en la conversación</strong> para que nos llegue.</>
              : 'Todavía no podemos abrir WhatsApp desde la web. Copia el mensaje y envíalo por nuestra página de Facebook.'}
          </p>
          <p className="mt-4 inline-block rounded-boton bg-fondo px-4 py-1.5 text-sm font-semibold">
            Código del pedido: <span className="tabular-nums">{pedido.codigo}</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {enviado ? (
              <Boton href={pedido.url} target="_blank" rel="noopener noreferrer"><Icono nombre="whatsapp" className="size-5" /> Abrir WhatsApp de nuevo</Boton>
            ) : (
              <Boton href={TIENDA.facebook} target="_blank" rel="noopener noreferrer"><Icono nombre="facebook" className="size-5" /> Abrir Facebook</Boton>
            )}
            <Boton variante="secundario" onClick={copiar}>{copiado ? 'Mensaje copiado ✓' : 'Copiar mensaje'}</Boton>
          </div>
          <p role="status" className="sr-only">{copiado ? 'Mensaje copiado' : ''}</p>
        </div>

        <section className="mt-8" aria-labelledby="pasos-titulo">
          <h2 id="pasos-titulo" className="text-2xl">Qué sigue</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['1', enviado ? 'Envía el mensaje' : 'Envía el mensaje', 'Presiona «Enviar» en WhatsApp con el pedido ya escrito.'],
              ['2', 'Lo confirmamos', 'Te respondemos con la disponibilidad, el costo del envío según tu zona y la forma de pago.'],
              ['3', 'Coordinamos la entrega', `Acordamos día y horario de entrega en ${TIENDA.cobertura}.`],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-tarjeta bg-blanco p-5 shadow-tarjeta">
                <span className="flex size-8 items-center justify-center rounded-full bg-azul text-sm font-bold text-blanco">{n}</span>
                <h3 className="mt-3 text-lg">{t}</h3>
                <p className="mt-1 text-sm text-noche-suave">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6" aria-labelledby="detalle-titulo">
          <h2 id="detalle-titulo" className="text-2xl">Resumen del pedido</h2>
          <ul className="mt-4 divide-y divide-durazno-oscuro/70">
            {pedido.lineas.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <p><span className="font-semibold">{l.marca} {l.nombre}</span><br /><span className="text-sm text-noche-suave">{l.presentacion} × {l.cantidad}</span></p>
                <p className="font-bold tabular-nums">{l.subtotal == null ? 'Consultar precio' : formatearPrecio(l.subtotal)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between border-t border-durazno-oscuro pt-4">
            <span className="font-display text-lg font-bold">Total productos</span>
            <span className="font-display text-2xl font-bold tabular-nums">{formatearPrecio(pedido.total)}</span>
          </p>
          <p className="mt-1 text-sm text-noche-suave">Envío: se confirma por WhatsApp según tu zona.{pedido.hayPorConsultar && ' El total no incluye los productos por consultar.'}</p>
        </section>

        <p className="mt-8 text-center">
          <Link to="/catalogo" className="font-semibold text-azul-oscuro underline-offset-4 hover:underline">Seguir mirando el catálogo</Link>
        </p>
      </div>
    </div>
  );
}
