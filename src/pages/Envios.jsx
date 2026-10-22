import Migas from '../components/ui/Migas.jsx';
import Boton from '../components/ui/Boton.jsx';
import Icono from '../components/ui/Icono.jsx';
import { TIENDA } from '../config/store';
import { numeroWhatsApp } from '../lib/pedido.js';
import { META_ESTATICAS } from '../lib/seo.js';
import { usePagina } from '../hooks/usePagina.js';

const BLOQUES = [
  {
    icono: 'pin',
    titulo: 'Dónde entregamos',
    texto: `Hacemos entregas en ${TIENDA.cobertura}. Si estás en otra ciudad, escríbenos y vemos si podemos ayudarte.`,
  },
  {
    icono: 'whatsapp',
    titulo: 'Costo y disponibilidad',
    texto: 'El costo del envío y la disponibilidad de tu pedido se confirman por WhatsApp según tu zona. El total de la tienda es solo el de los productos.',
  },
  {
    icono: 'camion',
    titulo: 'Cómo y cuándo',
    texto: 'Cuando nos envías tu pedido, te respondemos con el valor del envío y acordamos contigo la dirección, el día y el horario de entrega.',
  },
  {
    icono: 'caja',
    titulo: 'Cuando lo recibas',
    texto: 'Revisa que las bolsas lleguen cerradas y que sean las que pediste. Si algo no está bien, avísanos de inmediato y lo resolvemos.',
  },
  {
    icono: 'escudo',
    titulo: 'Cambios y devoluciones',
    texto: 'Si recibes un producto dañado o distinto al que pediste, escríbenos con una foto y lo cambiamos. Por higiene y seguridad de los animales, no recibimos bolsas abiertas, salvo que tengan un defecto.',
  },
];

export default function Envios() {
  usePagina(META_ESTATICAS['/envios-y-devoluciones']);
  const numero = numeroWhatsApp(TIENDA.whatsapp);
  const excluidas = TIENDA.zonasExcluidas;

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Envíos y devoluciones' }]} />
      <header className="mt-4 mb-10 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">Envíos y devoluciones</h1>
        <p className="mt-3 text-lg text-cacao-suave">Lo esencial para recibir el alimento de tu mascota sin complicaciones.</p>
      </header>

      <ul className="grid max-w-4xl gap-5 sm:grid-cols-2">
        {BLOQUES.map((b) => (
          <li key={b.titulo} className="rounded-tarjeta bg-blanco p-6 shadow-tarjeta">
            <span className="flex size-11 items-center justify-center rounded-full bg-arena text-terracota"><Icono nombre={b.icono} className="size-6" /></span>
            <h2 className="mt-4 text-xl">{b.titulo}</h2>
            <p className="mt-2 text-cacao-suave">{b.texto}</p>
          </li>
        ))}
      </ul>

      {excluidas.length > 0 && (
        <div className="mt-6 flex max-w-4xl gap-3 rounded-tarjeta border border-miel bg-miel/15 p-5" role="note">
          <Icono nombre="alerta" className="mt-0.5 size-5 shrink-0 text-terracota-oscura" />
          <p><strong>Zonas donde no entregamos por ahora:</strong> {excluidas.join(', ')}. Si estás en una de ellas, escríbenos y revisamos otras opciones.</p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <p className="text-cacao-suave">¿Quieres saber el costo para tu zona?</p>
        {numero ? (
          <Boton href={`https://wa.me/${numero}?text=${encodeURIComponent('Hola, quiero consultar el costo de envío a mi zona.')}`} target="_blank" rel="noopener noreferrer">
            <Icono nombre="whatsapp" className="size-5" /> Preguntar por WhatsApp
          </Boton>
        ) : (
          <Boton to="/contacto">Escríbenos</Boton>
        )}
      </div>
    </div>
  );
}
