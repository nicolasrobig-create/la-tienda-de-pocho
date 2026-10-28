import Boton from '../components/ui/Boton.jsx';
import Migas from '../components/ui/Migas.jsx';
import Icono from '../components/ui/Icono.jsx';
import Foto from '../components/ui/Foto.jsx';
import { marcas, productos } from '../lib/datos.js';
import { TIENDA } from '../config/store';
import { usePagina } from '../hooks/usePagina.js';
import { META_ESTATICAS } from '../lib/seo.js';

export default function Nosotros() {
  usePagina(META_ESTATICAS['/nosotros']);
  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Sobre nosotros' }]} />
      <header className="mt-4 mb-10 grid items-center gap-8 md:grid-cols-[1.25fr_1fr] md:gap-12">
        <div>
          <h1 className="text-4xl sm:text-5xl">Una tienda hecha para quienes quieren a su mascota</h1>
          <p className="mt-4 max-w-xl text-lg text-noche-suave">
            La Tienda de Pocho vende alimento y accesorios para mascotas en {TIENDA.ciudad}. Ahora también puedes elegir y pedir desde tu casa.
          </p>
        </div>
        <Foto
          nombre="terranova-tienda"
          alt="Dos perros terranova sentados dentro de la tienda, frente a los cajones de alimento a granel"
          sizes="(min-width: 768px) 380px, 80vw"
          prioridad
          className="aspect-[4/5] w-full max-w-sm justify-self-center rounded-[1.75rem] border-4 border-blanco shadow-elevada md:rotate-2"
        />
      </header>

      <div className="grid max-w-4xl gap-5 md:grid-cols-3">
        {[
          { n: marcas.length, t: 'marcas', d: 'de alimento básico a premium y veterinario.' },
          { n: productos.length, t: 'productos', d: 'en distintas presentaciones y tamaños de bolsa.' },
          { n: 2, t: 'animales', d: 'gatos y perros.' },
        ].map((x) => (
          <div key={x.t} className="rounded-tarjeta bg-durazno p-6">
            <p className="font-display text-5xl font-bold text-azul">{x.n}</p>
            <p className="mt-1 font-display text-xl font-bold">{x.t}</p>
            <p className="mt-1 text-sm text-noche-suave">{x.d}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 max-w-2xl space-y-4 text-lg leading-relaxed" aria-labelledby="como-titulo">
        <h2 id="como-titulo" className="text-3xl">Cómo trabajamos</h2>
        <p>Elegimos marcas que conocemos y que nuestros clientes piden: desde alimentos de uso diario hasta dietas pensadas para condiciones específicas, como el cuidado urinario, renal o digestivo.</p>
        <p>Si tu mascota necesita una dieta veterinaria, te recomendamos consultarlo con tu veterinario. Y si no sabes por dónde empezar, cuéntanos de tu mascota y te ayudamos a elegir.</p>
      </section>

      <section className="mt-14" aria-labelledby="local-titulo">
        <h2 id="local-titulo" className="text-3xl">Nuestro local</h2>
        <p className="mt-2 max-w-2xl text-noche-suave">Así se ve la tienda por dentro: las marcas a la vista y cada bolsa en su lugar.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Foto
            nombre="local-interior"
            alt="Interior de la tienda con estantes de alimento, juguetes y accesorios colgados"
            sizes="(min-width: 1024px) 660px, (min-width: 768px) 60vw, 92vw"
            className="aspect-[2/1] w-full rounded-tarjeta shadow-tarjeta md:col-span-2"
          />
          <Foto
            nombre="bodega-proplan"
            alt="Góndola con bolsas de alimento Pro Plan para perros ordenadas por etapa de vida"
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 30vw, 92vw"
            className="aspect-[4/3] w-full rounded-tarjeta shadow-tarjeta md:aspect-auto md:h-full"
          />
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Boton to="/catalogo">Ver el catálogo</Boton>
        <Boton to="/contacto" variante="secundario">Escríbenos</Boton>
        <Boton href={TIENDA.facebook} target="_blank" rel="noopener noreferrer" variante="suave"><Icono nombre="facebook" className="size-5" /> Facebook</Boton>
      </div>
    </div>
  );
}
