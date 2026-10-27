import { useParams } from 'react-router-dom';
import ExplorarCatalogo from '../components/catalogo/ExplorarCatalogo.jsx';
import Migas from '../components/ui/Migas.jsx';
import Boton from '../components/ui/Boton.jsx';
import EstadoVacio from '../components/ui/EstadoVacio.jsx';
import { obtenerMarca } from '../lib/datos.js';
import { pluralizar } from '../lib/formato.js';
import { usePagina } from '../hooks/usePagina.js';
import { metaMarca } from '../lib/seo.js';

export default function Marca() {
  const { slug } = useParams();
  const marca = obtenerMarca(slug);
  usePagina(marca ? metaMarca(marca) : { titulo: 'Marca no encontrada', noindex: true });

  if (!marca) {
    return (
      <div className="contenedor py-16">
        <EstadoVacio principal icono="buscar" titulo="No encontramos esa marca" acciones={<Boton to="/#marcas">Ver todas las marcas</Boton>}>
          Revisa el enlace o elige una marca de la lista.
        </EstadoVacio>
      </div>
    );
  }

  const animales = [...marca.animales].map((a) => (a === 'felino' ? 'gatos' : 'perros')).join(' y ');

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Marcas', to: '/#marcas' }, { etiqueta: marca.nombre }]} />
      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{marca.nombre}</h1>
        <p className="mt-2 text-noche-suave">{pluralizar(marca.total, 'producto', 'productos')} para {animales}.</p>
      </header>
      <ExplorarCatalogo marcaFija={marca.slug} />
    </div>
  );
}
