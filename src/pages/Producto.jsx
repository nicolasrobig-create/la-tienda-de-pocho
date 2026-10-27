import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GaleriaProducto from '../components/producto/GaleriaProducto.jsx';
import TarjetaProducto from '../components/catalogo/TarjetaProducto.jsx';
import SelectorCantidad from '../components/ui/SelectorCantidad.jsx';
import Migas from '../components/ui/Migas.jsx';
import Boton from '../components/ui/Boton.jsx';
import Icono from '../components/ui/Icono.jsx';
import EstadoVacio from '../components/ui/EstadoVacio.jsx';
import { obtenerProducto, productos, variantesDe, precioPorKg } from '../lib/datos.js';
import { formatearPrecio, nombreAnimal } from '../lib/formato.js';
import { useCarrito } from '../context/CarritoContext.jsx';
import { usePagina } from '../hooks/usePagina.js';
import { metaProducto } from '../lib/seo.js';

function NoEncontrado() {
  usePagina('Producto no encontrado');
  return (
    <div className="contenedor py-16">
      <EstadoVacio principal icono="buscar" titulo="No encontramos ese producto" acciones={<Boton to="/catalogo">Ver el catálogo</Boton>}>
        Puede que ya no esté disponible o que el enlace tenga un error.
      </EstadoVacio>
    </div>
  );
}

export default function Producto() {
  const { id } = useParams();
  const producto = obtenerProducto(id);
  const { agregar, cantidadDe } = useCarrito();
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => setCantidad(1), [id]);
  usePagina(producto ? metaProducto(producto) : { titulo: 'Producto no encontrado', noindex: true });

  if (!producto) return <NoEncontrado />;

  const variantes = variantesDe(producto);
  const veterinario = producto.etiquetas.includes('dieta veterinaria');
  const sinPrecio = producto.precio == null;
  const porKg = precioPorKg(producto);
  const enCarrito = cantidadDe(producto.id);
  const total = sinPrecio ? null : producto.precio * cantidad;

  const relacionados = [
    ...productos.filter((p) => p.slugMarca === producto.slugMarca && p.nombre !== producto.nombre && p.tipoAnimal === producto.tipoAnimal),
    ...productos.filter((p) => p.slugMarca !== producto.slugMarca && p.tipoAnimal === producto.tipoAnimal && p.etiquetas.some((t) => producto.etiquetas.includes(t) && !['gatos', 'perros', 'premium'].includes(t))),
  ]
    .filter((p, i, a) => a.findIndex((x) => x.nombre === p.nombre && x.marca === p.marca) === i)
    .slice(0, 4);

  const etiquetas = producto.etiquetas.filter((t) => !['gatos', 'perros'].includes(t));

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[
        { etiqueta: 'Inicio', to: '/' },
        { etiqueta: 'Catálogo', to: '/catalogo' },
        { etiqueta: producto.marca, to: `/marca/${producto.slugMarca}` },
        { etiqueta: producto.nombre },
      ]} />

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
        <div className="md:sticky md:top-36 md:self-start">
          <GaleriaProducto producto={producto} />
        </div>

        <div className="motion-safe:animate-subir">
          <Link to={`/marca/${producto.slugMarca}`} className="text-sm font-bold tracking-wider text-azul-oscuro uppercase underline-offset-4 hover:underline">
            {producto.marca}
          </Link>
          <h1 className="mt-1 text-3xl sm:text-4xl">{producto.nombre}</h1>
          <p className="mt-2 text-noche-suave">Alimento para {nombreAnimal(producto.tipoAnimal)} · {producto.presentacion}</p>

          {etiquetas.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {etiquetas.map((t) => (
                <li key={t}>
                  <Link to={`/catalogo?et=${encodeURIComponent(t)}`} className="inline-block rounded-boton bg-durazno px-3 py-1 text-sm hover:bg-durazno-oscuro">{t}</Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-y border-durazno-oscuro py-5">
            <p className={`font-display font-bold tabular-nums ${sinPrecio ? 'text-2xl text-noche-suave' : 'text-4xl'}`}>
              {formatearPrecio(producto.precio)}
            </p>
            {porKg && <p className="mt-1 text-sm text-noche-suave">Aprox. {formatearPrecio(porKg)} por kilo</p>}
            {sinPrecio && <p className="mt-1 text-sm text-noche-suave">Escríbenos y te confirmamos el valor y la disponibilidad.</p>}
          </div>

          {variantes.length > 1 && (
            <div className="mt-6">
              <h2 className="mb-3 font-display text-lg font-bold">Presentación</h2>
              <ul className="flex flex-wrap gap-2.5">
                {variantes.map((v) => (
                  <li key={v.id}>
                    <Link
                      to={`/producto/${v.id}`}
                      replace
                      aria-current={v.id === producto.id ? 'true' : undefined}
                      className="flex min-h-11 flex-col justify-center rounded-xl border-2 border-durazno-oscuro bg-blanco px-4 py-2 text-left transition-colors hover:border-noche aria-[current=true]:border-azul aria-[current=true]:bg-durazno"
                    >
                      <span className="font-semibold">{v.presentacion}</span>
                      <span className="text-xs text-noche-suave tabular-nums">{formatearPrecio(v.precio)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <SelectorCantidad valor={cantidad} onCambiar={setCantidad} />
            <Boton onClick={() => agregar(producto.id, cantidad)} disabled={!producto.stock} className="min-h-12 flex-1 sm:flex-none sm:px-8">
              <Icono nombre="carrito" className="size-5" />
              {producto.stock ? 'Agregar al carrito' : 'Agotado'}
              {total != null && producto.stock && <span className="font-normal opacity-90 tabular-nums">· {formatearPrecio(total)}</span>}
            </Boton>
          </div>
          {enCarrito > 0 && (
            <p className="mt-3 text-sm text-oliva">
              <Icono nombre="check" className="mr-1 inline size-4" />
              Ya tienes {enCarrito} en el carrito. <Link to="/carrito" className="font-semibold underline underline-offset-4">Ver carrito</Link>
            </p>
          )}

          {veterinario && (
            <div className="mt-6 flex gap-3 rounded-tarjeta border border-ambar bg-ambar/15 p-4 text-sm" role="note">
              <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-azul-oscuro" />
              <p><strong>Dieta veterinaria.</strong> Úsala bajo supervisión de un veterinario. Si no tienes la fórmula indicada, escríbenos y te orientamos.</p>
            </div>
          )}

          <ul className="mt-6 space-y-2 text-sm text-noche-suave">
            <li className="flex items-center gap-2.5"><Icono nombre="camion" className="size-5 text-azul" /> Entrega en Bogotá. <Link to="/envios-y-devoluciones" className="underline underline-offset-4 hover:text-azul">Cómo funciona</Link></li>
            <li className="flex items-center gap-2.5"><Icono nombre="info" className="size-5 text-azul" /> ¿Dudas sobre cuál elegir? <Link to="/contacto" className="underline underline-offset-4 hover:text-azul">Escríbenos</Link></li>
          </ul>
        </div>
      </div>

      <section className="mt-12 grid gap-8 border-t border-durazno-oscuro pt-10 md:grid-cols-[3fr_2fr] lg:gap-14" aria-labelledby="desc-titulo">
        <div>
          <h2 id="desc-titulo" className="text-2xl">Sobre este alimento</h2>
          <p className="mt-3 max-w-prose text-lg leading-relaxed">{producto.descripcion}</p>
          {producto.ingredientes.length > 0 && (
            <details className="group mt-6 rounded-tarjeta bg-durazno/60 p-4 open:bg-durazno/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-bold">
                Ingredientes destacados
                <Icono nombre="chevron" className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-azul">
                {producto.ingredientes.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </details>
          )}
        </div>
        {producto.beneficios.length > 0 && (
          <div>
            <h2 className="text-2xl">Por qué elegirlo</h2>
            <ul className="mt-3 space-y-2.5">
              {producto.beneficios.map((b) => (
                <li key={b} className="flex gap-2.5"><Icono nombre="check" className="mt-1 size-5 shrink-0 text-oliva" />{b}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {relacionados.length > 0 && (
        <section className="mt-14" aria-labelledby="rel-titulo">
          <h2 id="rel-titulo" className="mb-5 text-2xl">También te puede interesar</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {relacionados.map((p) => <li key={p.id}><TarjetaProducto producto={p} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
