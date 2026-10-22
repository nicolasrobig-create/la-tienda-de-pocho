import { useSearchParams } from 'react-router-dom';
import ExplorarCatalogo from '../components/catalogo/ExplorarCatalogo.jsx';
import Migas from '../components/ui/Migas.jsx';
import { usePagina } from '../hooks/usePagina.js';
import { metaCatalogo } from '../lib/seo.js';

const TITULOS = { gato: 'Alimento para gatos', perro: 'Alimento para perros' };

export default function Catalogo() {
  const [params] = useSearchParams();
  const titulo = TITULOS[params.get('animal')] ?? 'Catálogo';
  usePagina(metaCatalogo({ animal: params.get('animal'), q: params.get('q') }));

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Catálogo' }]} />
      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{titulo}</h1>
        <p className="mt-2 text-cacao-suave">Filtra por marca, precio, presentación o necesidad. Todos los precios están en pesos colombianos.</p>
      </header>
      <ExplorarCatalogo />
    </div>
  );
}
