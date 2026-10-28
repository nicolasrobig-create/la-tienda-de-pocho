import { useState } from 'react';
import { flushSync } from 'react-dom';
import Boton from '../components/ui/Boton.jsx';
import Campo from '../components/ui/Campo.jsx';
import Icono from '../components/ui/Icono.jsx';
import Migas from '../components/ui/Migas.jsx';
import { TIENDA } from '../config/store';
import { limpiar, LIMITES, numeroWhatsApp, telefonoValido, urlWhatsApp } from '../lib/pedido.js';
import { usePagina } from '../hooks/usePagina.js';
import { META_ESTATICAS } from '../lib/seo.js';

const WHATSAPP = numeroWhatsApp(TIENDA.whatsapp);

function validar(v) {
  const e = {};
  if (limpiar(v.nombre).length < 2) e.nombre = 'Escribe tu nombre.';
  if (!telefonoValido(v.telefono)) e.telefono = 'Revisa tu número: escribe un celular de 10 dígitos, como 300 123 4567.';
  return e;
}

const PASOS = [
  'Escribes tu nombre y tu número de WhatsApp.',
  'Se abre WhatsApp con el mensaje ya escrito.',
  'Te confirmamos por ahí y seguimos tus pedidos con ese mismo número.',
];

// Ingreso con WhatsApp: no hay contraseñas ni cuenta guardada. Nada de lo que se escribe aquí se almacena:
// solo viaja en el mensaje que el cliente envía.
export default function Ingresar() {
  usePagina(META_ESTATICAS['/ingresar']);
  const [valores, setValores] = useState({ nombre: '', telefono: '' });
  const [errores, setErrores] = useState({});

  const cambiar = (campo) => (e) => {
    setValores((v) => ({ ...v, [campo]: e.target.value }));
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const enviar = (e) => {
    e.preventDefault();
    const er = validar(valores);
    const formulario = e.currentTarget;
    // flushSync: aria-invalid tiene que estar en el DOM antes de mover el foco.
    flushSync(() => setErrores(er));
    if (Object.keys(er).length) {
      formulario.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const nombre = limpiar(valores.nombre).slice(0, LIMITES.nombre);
    const telefono = limpiar(valores.telefono);
    const texto = `Hola, soy ${nombre}. Quiero ingresar a ${TIENDA.nombre} con este número: ${telefono}. ¿Me confirman, por favor?`;
    window.open(urlWhatsApp(WHATSAPP, texto), '_blank', 'noopener');
  };

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Ingresar' }]} />
      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">Ingresar</h1>
        <p className="mt-2 text-lg text-noche-suave">Sin contraseñas: nos escribes por WhatsApp y confirmamos tu número.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
        {WHATSAPP ? (
          <form onSubmit={enviar} noValidate className="space-y-5 rounded-tarjeta border border-durazno-oscuro bg-durazno-claro p-6 shadow-tarjeta sm:p-8" aria-label="Ingresar con WhatsApp">
            <Campo etiqueta="Tu nombre" required autoComplete="name" maxLength={LIMITES.nombre} value={valores.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
            <Campo
              etiqueta="Tu número de WhatsApp"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={valores.telefono}
              onChange={cambiar('telefono')}
              error={errores.telefono}
              ayuda="Celular de 10 dígitos. Es el número con el que te vamos a reconocer."
            />
            <Boton type="submit" className="min-h-12 w-full sm:w-auto sm:px-8"><Icono nombre="whatsapp" className="size-5" /> Continuar por WhatsApp</Boton>
            <p className="text-sm text-noche-suave">No guardamos tu nombre ni tu número en esta página: solo viajan en el mensaje que tú envías.</p>
          </form>
        ) : (
          <section className="rounded-tarjeta border border-durazno-oscuro bg-durazno-claro p-6 shadow-tarjeta sm:p-8" aria-labelledby="sin-canal" role="status">
            <h2 id="sin-canal" className="text-2xl">Por ahora, escríbenos por otro canal</h2>
            <p className="mt-2 text-noche-suave">Todavía no tenemos WhatsApp configurado en la página. Puedes hablar con nosotros por Facebook o por teléfono.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Boton href={TIENDA.facebook} target="_blank" rel="noopener noreferrer"><Icono nombre="facebook" className="size-5" /> Abrir Facebook</Boton>
              <Boton to="/contacto" variante="secundario">Ver contacto</Boton>
            </div>
          </section>
        )}

        <aside aria-label="Cómo funciona">
          <h2 className="text-xl">Cómo funciona</h2>
          <ol className="mt-4 space-y-4">
            {PASOS.map((p, i) => (
              <li key={p} className="flex gap-3.5">
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-cielo font-bold text-tinta tabular-nums">{i + 1}</span>
                <span className="pt-0.5">{p}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
