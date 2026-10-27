import { Link } from 'react-router-dom';
import Boton from '../components/ui/Boton.jsx';
import Icono from '../components/ui/Icono.jsx';
import Foto from '../components/ui/Foto.jsx';
import ImagenProducto from '../components/ui/ImagenProducto.jsx';
import { ImagenLogo } from '../components/layout/Logo.jsx';
import TarjetaProducto from '../components/catalogo/TarjetaProducto.jsx';
import { marcas, obtenerProducto, productos } from '../lib/datos.js';
import { TIENDA } from '../config/store';
import { usePagina } from '../hooks/usePagina.js';
import { META_ESTATICAS } from '../lib/seo.js';

// Debe coincidir con el preload de la portada en scripts/postbuild.js (FOTO_HERO y SIZES_HERO)
export const SIZES_HERO = '(min-width: 768px) 260px, 62vw';
const IDS_GATOS = [
  'pro-plan-felino-adulto-3-kg', 'hills-felino-adulto-indoor-3-5-lb', 'taste-of-the-wild-felino-rocky-mountain-5-lb',
  'orijen-felino-original-cat-4-lb', 'nd-felino-tropical-adulto-1-5-kg', 'equilibrio-felino-adulto-1-5-kg',
];
const IDS_PERROS = [
  'hills-canino-adulto-small-bites-4-4-lb', 'hills-canino-puppy-small-bites-4-5-lb',
  'hills-canino-small-y-mini-adulto-pollo-4-5-lb', 'hills-canino-i-d-8-5-lb',
];

const NECESIDADES = [
  { etiqueta: 'Gatitos y cachorros', et: 'gatito', texto: 'Para crecer fuertes' },
  { etiqueta: 'Control de peso', et: 'control de peso', texto: 'Para mantener la figura' },
  { etiqueta: 'Cuidado urinario', et: 'cuidado urinario', texto: 'Apoyo del tracto urinario' },
  { etiqueta: 'Bolas de pelo', et: 'bolas de pelo', texto: 'Para pelaje largo' },
  { etiqueta: 'Sin granos', et: 'sin granos', texto: 'Recetas grain-free' },
  { etiqueta: 'Dietas veterinarias', et: 'dieta veterinaria', texto: 'Con indicación del veterinario' },
];

const seleccion = (ids) => ids.map(obtenerProducto).filter(Boolean);
const totalDe = (tipo) => productos.filter((p) => p.tipoAnimal === tipo).length;

export default function Inicio() {
  usePagina(META_ESTATICAS['/']);
  const contar = (et) => productos.filter((p) => p.etiquetas.includes(et)).length;

  return (
    <>
      {/* Hero */}
      <section className="degradado-hero sobre-oscuro relative overflow-hidden text-fondo">
        <div className="contenedor relative grid items-center gap-10 py-10 md:grid-cols-2 md:gap-6 md:py-16 lg:py-20">
          <div className="motion-safe:animate-subir">
            <ImagenLogo grande className="mb-6 w-52 rounded-2xl shadow-elevada sm:w-60" />
            <p className="mb-4 inline-flex items-center gap-2 rounded-boton bg-ambar px-3.5 py-1.5 text-sm font-semibold text-noche">
              <Icono nombre="pin" className="size-4" /> Entregamos en {TIENDA.cobertura}
            </p>
            <h1 className="text-4xl leading-[1.05] text-fondo sm:text-5xl lg:text-6xl">
              Buena comida para quien <span className="text-ambar">te espera en casa</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-fondo/90">
              Alimento para gatos y perros, desde marcas de siempre hasta dietas veterinarias. Elige con calma y te lo llevamos.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Boton to="/catalogo" variante="ambar" className="min-h-12 px-7">Ver el catálogo <Icono nombre="flecha" className="size-5" /></Boton>
              <Boton to="/catalogo?animal=gato" variante="claro" className="min-h-12 px-7">Para mi gato</Boton>
            </div>
          </div>

          <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[27rem] md:h-[30rem]">
            <div aria-hidden="true" className="absolute inset-x-[4%] inset-y-[6%] rounded-[2.5rem] bg-fondo/10" />
            <div className="absolute top-0 left-[1%] z-0 hidden w-[56%] -rotate-4 sm:block overflow-hidden rounded-[1.75rem] border-4 border-fondo shadow-elevada motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:-rotate-2">
              <Foto
                nombre="gata-churu"
                alt="Gata blanca lamiendo un snack Churu dentro de una canasta tejida"
                sizes={SIZES_HERO}
                className="aspect-[790/1271] w-full"
              />
            </div>
            <div className="absolute bottom-0 left-1/2 z-10 w-[62%] -translate-x-1/2 rotate-3 sm:right-[1%] sm:left-auto sm:w-[58%] sm:translate-x-0 overflow-hidden rounded-[1.75rem] border-4 border-fondo shadow-elevada motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:rotate-1">
              <Foto
                nombre="perro-pasto"
                alt="Perro blanco con manchas color canela sonriendo en el pasto junto a su pelota morada"
                sizes={SIZES_HERO}
                prioridad
                className="aspect-[550/815] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Puntos de confianza */}
      <section className="contenedor py-10" aria-label="Por qué comprar aquí">
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { i: 'camion', t: `Entrega en ${TIENDA.cobertura}`, d: 'Coordinamos contigo el día y la dirección.' },
            { i: 'caja', t: `${marcas.length} marcas`, d: 'Desde alimento diario hasta dietas veterinarias.' },
            { i: 'corazon', t: 'Te ayudamos a elegir', d: 'Cuéntanos de tu mascota y te recomendamos.' },
          ].map((x) => (
            <li key={x.t} className="elevar flex items-start gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-durazno text-azul"><Icono nombre={x.i} className="size-6" /></span>
              <div><h2 className="font-display text-lg font-bold">{x.t}</h2><p className="text-sm text-noche-suave">{x.d}</p></div>
            </li>
          ))}
        </ul>
      </section>

      {/* Gatos / Perros */}
      <section className="contenedor py-6" aria-labelledby="quien-titulo">
        <h2 id="quien-titulo" className="mb-6 text-3xl">¿Para quién es?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { to: '/catalogo?animal=gato', t: 'Gatos', n: totalDe('felino'), fondo: 'degradado-marca text-fondo', sub: 'text-fondo/90', ids: IDS_GATOS[3] },
            { to: '/catalogo?animal=perro', t: 'Perros', n: totalDe('canino'), fondo: 'bg-ambar text-noche', sub: 'text-noche', ids: IDS_PERROS[0] },
          ].map((c) => (
            <Link key={c.t} to={c.to} className={`group elevar relative flex min-h-48 items-end overflow-hidden rounded-[1.75rem] p-6 ${c.fondo}`}>
              <div aria-hidden="true" className="absolute top-4 right-4 aspect-[3/4] w-28 rotate-6 overflow-hidden rounded-xl border-4 border-fondo shadow-elevada transition-transform duration-500 motion-safe:group-hover:rotate-3 motion-safe:group-hover:scale-105 sm:w-32">
                <ImagenProducto producto={obtenerProducto(c.ids)} ajuste="cover" sizes="130px" className="size-full" />
              </div>
              <div>
                <p className="font-display text-4xl font-bold">{c.t}</p>
                <p className={`mt-1 flex items-center gap-2 ${c.sub}`}>{c.n} productos <Icono nombre="flecha" className="size-5 transition-transform motion-safe:group-hover:translate-x-1" /></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Necesidades */}
      <section className="contenedor py-10" aria-labelledby="nec-titulo">
        <h2 id="nec-titulo" className="mb-1 text-3xl">Busca por necesidad</h2>
        <p className="mb-6 text-noche-suave">Cada mascota es distinta. Estos atajos te llevan a los alimentos pensados para cada caso.</p>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {NECESIDADES.map((n) => (
            <li key={n.et}>
              <Link to={`/catalogo?et=${encodeURIComponent(n.et)}`} className="group elevar flex h-full flex-col justify-between gap-6 rounded-tarjeta border border-durazno-oscuro bg-blanco p-4 hover:border-ambar sm:p-5">
                <div>
                  <h3 className="font-display text-lg leading-tight font-bold sm:text-xl">{n.etiqueta}</h3>
                  <p className="mt-1 text-sm text-noche-suave">{n.texto}</p>
                </div>
                <p className="flex items-center justify-between text-sm font-semibold text-azul-oscuro">
                  {contar(n.et)} productos <Icono nombre="flecha" className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Selección */}
      <section className="contenedor py-10" aria-labelledby="gatos-titulo">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="gatos-titulo" className="text-3xl">Para gatos, una selección</h2>
          <Link to="/catalogo?animal=gato" className="font-semibold text-azul-oscuro underline-offset-4 hover:underline">Ver todo para gatos →</Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {seleccion(IDS_GATOS).map((p) => <li key={p.id}><TarjetaProducto producto={p} /></li>)}
        </ul>
      </section>

      <section className="contenedor py-10" aria-labelledby="perros-titulo">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="perros-titulo" className="text-3xl">Para perros</h2>
          <Link to="/catalogo?animal=perro" className="font-semibold text-azul-oscuro underline-offset-4 hover:underline">Ver todo para perros →</Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {seleccion(IDS_PERROS).map((p) => <li key={p.id}><TarjetaProducto producto={p} /></li>)}
        </ul>
      </section>

      {/* Marcas */}
      <section id="marcas" className="degradado-calido scroll-mt-40 py-14" aria-labelledby="marcas-titulo">
        <div className="contenedor">
          <div className="relative mb-8 overflow-hidden rounded-[1.75rem] shadow-elevada">
            <Foto
              nombre="bodega-pared"
              alt="Pared del local con góndolas llenas de bolsas de alimento de distintas marcas"
              sizes="(min-width: 1024px) 1008px, 92vw"
              className="aspect-[16/9] w-full sm:aspect-[2/1] lg:aspect-[21/9]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-noche/80 via-noche/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <h2 id="marcas-titulo" className="text-3xl text-fondo sm:text-4xl">Nuestras marcas</h2>
              <p className="mt-1 text-fondo/90">Entra a una marca para ver todo lo que tenemos.</p>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {marcas.map((m) => (
              <li key={m.slug}>
                <Link to={`/marca/${m.slug}`} className="elevar flex min-h-14 items-center justify-between gap-2 rounded-xl bg-blanco px-4 py-3 font-display text-lg font-bold shadow-tarjeta hover:bg-azul hover:text-blanco">
                  {m.nombre}
                  <span className="font-sans text-sm font-medium opacity-70 tabular-nums">{m.total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ayuda */}
      <section className="contenedor py-14" aria-labelledby="ayuda-titulo">
        <div className="degradado-hero sobre-oscuro flex flex-col items-start justify-between gap-6 rounded-[1.75rem] p-8 text-fondo shadow-elevada sm:flex-row sm:items-center sm:p-10">
          <div className="max-w-xl">
            <h2 id="ayuda-titulo" className="text-3xl text-fondo">¿No sabes cuál elegir?</h2>
            <p className="mt-2 text-fondo/90">Cuéntanos la edad, el peso y si tu mascota tiene alguna condición. Te orientamos sin compromiso.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Boton to="/contacto" variante="ambar">Escríbenos</Boton>
            <Boton href={TIENDA.facebook} target="_blank" rel="noopener noreferrer" variante="claro">
              <Icono nombre="facebook" className="size-5" /> Facebook
            </Boton>
          </div>
        </div>
      </section>
    </>
  );
}
