import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import Boton from '../components/ui/Boton.jsx';
import Campo from '../components/ui/Campo.jsx';
import Icono from '../components/ui/Icono.jsx';
import ImagenProducto from '../components/ui/ImagenProducto.jsx';
import EstadoVacio from '../components/ui/EstadoVacio.jsx';
import Migas from '../components/ui/Migas.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { TIENDA } from '../config/store';
import { formatearPrecio, pluralizar } from '../lib/formato.js';
import {
  LIMITES, construirMensaje, crearCodigo, limpiar, numeroWhatsApp, resumirLineas, urlWhatsApp, validarPedido,
} from '../lib/pedido.js';
import { META_ESTATICAS } from '../lib/seo.js';
import { usePagina } from '../hooks/usePagina.js';

const VACIO = { nombre: '', telefono: '', direccion: '', barrio: '', notas: '' };

export default function Checkout() {
  usePagina(META_ESTATICAS['/checkout']);
  const navegar = useNavigate();
  const { lineas, totalUnidades, total, hayPorConsultar, vaciar } = useCarrito();
  // Los datos personales viven solo en este estado (memoria): no se guardan en localStorage ni en la URL.
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const numero = numeroWhatsApp(TIENDA.whatsapp);

  if (lineas.length === 0) {
    return (
      <div className="contenedor py-16">
        <EstadoVacio principal icono="carrito" titulo="No hay nada para pedir" acciones={<Boton to="/catalogo">Ver el catálogo</Boton>}>
          Agrega productos al carrito y vuelve para completar tu pedido.
        </EstadoVacio>
      </div>
    );
  }

  const cambiar = (campo) => (e) => {
    setValores((v) => ({ ...v, [campo]: e.target.value }));
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const enviar = (e) => {
    e.preventDefault();
    const formulario = e.currentTarget;
    const er = validarPedido(valores, TIENDA.zonasExcluidas);
    flushSync(() => setErrores(er)); // aria-invalid debe existir en el DOM antes de mover el foco
    if (Object.keys(er).length) {
      formulario.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const codigo = crearCodigo();
    const mensaje = construirMensaje({
      codigo, tienda: TIENDA.nombre, lineas: resumirLineas(lineas), total, hayPorConsultar, cliente: valores,
    });
    const url = numero ? urlWhatsApp(numero, mensaje) : null;
    // window.open debe ocurrir dentro del clic para que el navegador no lo bloquee.
    if (url) window.open(url, '_blank', 'noopener');

    navegar('/pedido-confirmado', {
      replace: true,
      state: {
        codigo, mensaje, url, total, hayPorConsultar,
        lineas: resumirLineas(lineas),
        nombre: limpiar(valores.nombre).split(' ')[0],
      },
    });
    // Solo se vacía el carrito si el pedido realmente salió hacia WhatsApp.
    if (url) vaciar();
  };

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Carrito', to: '/carrito' }, { etiqueta: 'Datos de entrega' }]} />
      <h1 className="mt-4 mb-8 text-4xl sm:text-5xl">Datos de entrega</h1>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
        <form onSubmit={enviar} noValidate aria-label="Datos de entrega" className="space-y-5 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-8">
          <p className="flex gap-2.5 rounded-xl bg-durazno p-4 text-sm" role="note">
            <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-azul" />
            <span>
              {numero
                ? <>Al confirmar, se abre WhatsApp con tu pedido listo para enviar. <strong>El costo del envío y la disponibilidad te los confirmamos por WhatsApp</strong>, según tu zona.</>
                : <>Al confirmar, te mostramos tu pedido listo para copiar y enviarnos. <strong>El costo del envío y la disponibilidad se confirman</strong> según tu zona.</>}
            </span>
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo etiqueta="Nombre completo" required autoComplete="name" maxLength={LIMITES.nombre + 20} value={valores.nombre} onChange={cambiar('nombre')} error={errores.nombre} className="sm:col-span-2" />
            <Campo etiqueta="Teléfono / WhatsApp" required type="tel" inputMode="tel" autoComplete="tel-national" placeholder="3001234567" value={valores.telefono} onChange={cambiar('telefono')} error={errores.telefono} ayuda="Para coordinar la entrega." />
            <Campo etiqueta="Barrio o localidad" required autoComplete="address-level3" maxLength={LIMITES.barrio + 20} value={valores.barrio} onChange={cambiar('barrio')} error={errores.barrio} />
            <Campo etiqueta="Dirección" required autoComplete="street-address" maxLength={LIMITES.direccion + 20} placeholder="Carrera 69 #98-29, apto 301" value={valores.direccion} onChange={cambiar('direccion')} error={errores.direccion} className="sm:col-span-2" />
            <Campo etiqueta="Notas (opcional)" multilinea maxLength={LIMITES.notas + 50} placeholder="Ej.: dejar con el portero, horario preferido, indicaciones para llegar…" value={valores.notas} onChange={cambiar('notas')} error={errores.notas} ayuda={`${limpiar(valores.notas).length}/${LIMITES.notas}`} className="sm:col-span-2" />
          </div>

          {TIENDA.zonasExcluidas.length > 0 && (
            <p className="text-sm text-noche-suave">Por ahora no entregamos en: {TIENDA.zonasExcluidas.join(', ')}.</p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-durazno-oscuro pt-5">
            <Boton type="submit" className="min-h-12 w-full sm:w-auto sm:px-8">
              {numero ? <><Icono nombre="whatsapp" className="size-5" /> Enviar pedido por WhatsApp</> : 'Confirmar pedido'}
            </Boton>
            <Link to="/carrito" className="font-semibold text-azul-oscuro underline-offset-4 hover:underline">← Volver al carrito</Link>
          </div>
          <p className="text-xs text-noche-suave">
            Usamos tus datos solo para coordinar este pedido. No los guardamos en tu navegador.
          </p>
        </form>

        <aside aria-labelledby="resumen-pedido" className="rounded-tarjeta bg-durazno p-6 lg:sticky lg:top-36">
          <h2 id="resumen-pedido" className="text-2xl">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-durazno-oscuro/70">
            {lineas.map((l) => (
              <li key={l.id} className="flex gap-3 py-3 first:pt-0">
                <ImagenProducto producto={l.producto} sizes="56px" className="aspect-[4/5] w-14 shrink-0 rounded-lg border border-durazno-oscuro" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{l.producto.marca} {l.producto.nombre}</p>
                  <p className="text-noche-suave">{l.producto.presentacion} × {l.cantidad}</p>
                </div>
                <p className="text-sm font-bold tabular-nums">{l.subtotal == null ? 'Consultar' : formatearPrecio(l.subtotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-durazno-oscuro pt-4 text-[0.95rem]">
            <div className="flex justify-between gap-4"><dt>{pluralizar(totalUnidades, 'producto', 'productos')}</dt><dd className="font-semibold tabular-nums">{formatearPrecio(total)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Envío</dt><dd className="text-right text-noche-suave">Se confirma por WhatsApp</dd></div>
          </dl>
          {hayPorConsultar && <p className="mt-3 text-sm text-noche-suave">El total no incluye los productos con precio por consultar.</p>}
        </aside>
      </div>
    </div>
  );
}
