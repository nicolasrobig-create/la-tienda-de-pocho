import Boton from '../components/ui/Boton.jsx';
import Migas from '../components/ui/Migas.jsx';
import Icono from '../components/ui/Icono.jsx';
import { marcas, productos } from '../lib/datos.js';
import { TIENDA } from '../config/store';
import { usePagina } from '../hooks/usePagina.js';
import { META_ESTATICAS } from '../lib/seo.js';

export default function Nosotros() {
  usePagina(META_ESTATICAS['/nosotros']);
  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Sobre nosotros' }]} />
      <header className="mt-4 mb-10 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">Una tienda hecha para quienes quieren a su mascota</h1>
        <p className="mt-4 text-lg text-cacao-suave">
          La Tienda de Pocho vende alimento y accesorios para mascotas en {TIENDA.ciudad}. Ahora también puedes elegir y pedir desde tu casa.
        </p>
      </header>

      <div className="grid max-w-4xl gap-5 md:grid-cols-3">
        {[
          { n: marcas.length, t: 'marcas', d: 'de alimento básico a premium y veterinario.' },
          { n: productos.length, t: 'productos', d: 'en distintas presentaciones y tamaños de bolsa.' },
          { n: 2, t: 'animales', d: 'gatos y perros.' },
        ].map((x) => (
          <div key={x.t} className="rounded-tarjeta bg-arena p-6">
            <p className="font-display text-5xl font-bold text-terracota">{x.n}</p>
            <p className="mt-1 font-display text-xl font-bold">{x.t}</p>
            <p className="mt-1 text-sm text-cacao-suave">{x.d}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 max-w-2xl space-y-4 text-lg leading-relaxed" aria-labelledby="como-titulo">
        <h2 id="como-titulo" className="text-3xl">Cómo trabajamos</h2>
        <p>Elegimos marcas que conocemos y que nuestros clientes piden: desde alimentos de uso diario hasta dietas pensadas para condiciones específicas, como el cuidado urinario, renal o digestivo.</p>
        <p>Si tu mascota necesita una dieta veterinaria, te recomendamos consultarlo con tu veterinario. Y si no sabes por dónde empezar, cuéntanos de tu mascota y te ayudamos a elegir.</p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Boton to="/catalogo">Ver el catálogo</Boton>
        <Boton to="/contacto" variante="secundario">Escríbenos</Boton>
        <Boton href={TIENDA.facebook} target="_blank" rel="noopener noreferrer" variante="suave"><Icono nombre="facebook" className="size-5" /> Facebook</Boton>
      </div>
    </div>
  );
}
