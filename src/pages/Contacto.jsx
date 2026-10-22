import { useState } from 'react';
import { flushSync } from 'react-dom';
import Boton from '../components/ui/Boton.jsx';
import Campo from '../components/ui/Campo.jsx';
import Icono from '../components/ui/Icono.jsx';
import Migas from '../components/ui/Migas.jsx';
import { TIENDA } from '../config/store';
import { numeroWhatsApp } from '../lib/pedido.js';

const WHATSAPP = numeroWhatsApp(TIENDA.whatsapp);
import { usePagina } from '../hooks/usePagina.js';
import { META_ESTATICAS } from '../lib/seo.js';

const VACIO = { nombre: '', contacto: '', mensaje: '' };

function validar(v) {
  const e = {};
  if (v.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.';
  const c = v.contacto.trim();
  if (!c) e.contacto = 'Déjanos un teléfono o un correo para responderte.';
  else if (!/^\S+@\S+\.\S+$/.test(c) && c.replace(/\D/g, '').length < 7) e.contacto = 'Revisa tu teléfono o correo: no parece válido.';
  if (v.mensaje.trim().length < 10) e.mensaje = 'Cuéntanos un poco más (al menos 10 caracteres).';
  return e;
}

export default function Contacto() {
  usePagina(META_ESTATICAS['/contacto']);
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [listo, setListo] = useState(null); // mensaje preparado cuando no hay canal directo
  const [copiado, setCopiado] = useState(false);

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
    const texto = `Hola, soy ${valores.nombre.trim()}. ${valores.mensaje.trim()} (Contacto: ${valores.contacto.trim()})`;
    if (WHATSAPP) window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    else if (TIENDA.email) window.location.href = `mailto:${TIENDA.email}?subject=${encodeURIComponent('Consulta desde la tienda')}&body=${encodeURIComponent(texto)}`;
    else setListo(texto);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(listo);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="contenedor py-6 sm:py-10">
      <Migas items={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Contacto' }]} />
      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">Hablemos</h1>
        <p className="mt-2 text-lg text-cacao-suave">Cuéntanos qué necesitas: ayuda para elegir, disponibilidad, un pedido especial. Te respondemos lo antes posible.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        {listo ? (
          <section className="rounded-tarjeta bg-blanco p-6 shadow-tarjeta sm:p-8" aria-labelledby="listo-titulo" role="status">
            <h2 id="listo-titulo" className="text-2xl">Tu mensaje está listo</h2>
            <p className="mt-2 text-cacao-suave">Aún no tenemos un canal de mensajes en esta página. Copia tu mensaje y envíalo por nuestra página de Facebook.</p>
            <p className="mt-4 rounded-xl bg-arena p-4 text-[0.95rem]">{listo}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Boton variante="suave" onClick={copiar}>{copiado ? 'Copiado ✓' : 'Copiar mensaje'}</Boton>
              <Boton href={TIENDA.facebook} target="_blank" rel="noopener noreferrer"><Icono nombre="facebook" className="size-5" /> Abrir Facebook</Boton>
              <Boton variante="fantasma" onClick={() => { setListo(null); setValores(VACIO); setCopiado(false); }}>Escribir otro</Boton>
            </div>
          </section>
        ) : (
          <form onSubmit={enviar} noValidate className="space-y-5 rounded-tarjeta bg-blanco p-6 shadow-tarjeta sm:p-8" aria-label="Formulario de contacto">
            <Campo etiqueta="Tu nombre" required autoComplete="name" value={valores.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
            <Campo etiqueta="Teléfono o correo" required autoComplete="email" value={valores.contacto} onChange={cambiar('contacto')} error={errores.contacto} ayuda="Para responderte." />
            <Campo etiqueta="Mensaje" required multilinea value={valores.mensaje} onChange={cambiar('mensaje')} error={errores.mensaje} placeholder="Ej.: Tengo un gato de 4 años esterilizado, ¿qué alimento me recomiendas?" />
            <Boton type="submit" className="min-h-12 w-full sm:w-auto sm:px-8">Enviar mensaje</Boton>
          </form>
        )}

        <aside className="space-y-4" aria-label="Otros datos de contacto">
          <div className="rounded-tarjeta bg-arena p-6">
            <h2 className="text-xl">Dónde estamos</h2>
            <ul className="mt-3 space-y-3 text-[0.95rem]">
              <li className="flex gap-2.5"><Icono nombre="pin" className="mt-0.5 size-5 shrink-0 text-terracota" /><span>Zona de cobertura: <strong>{TIENDA.cobertura}</strong>{TIENDA.direccion && <><br />{TIENDA.direccion}</>}</span></li>
              {TIENDA.horario && <li className="flex gap-2.5"><Icono nombre="reloj" className="mt-0.5 size-5 shrink-0 text-terracota" />{TIENDA.horario}</li>}
              {WHATSAPP && <li className="flex gap-2.5"><Icono nombre="whatsapp" className="mt-0.5 size-5 shrink-0 text-terracota" /><a className="underline underline-offset-4" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a></li>}
              {TIENDA.telefono && <li className="flex gap-2.5"><Icono nombre="telefono" className="mt-0.5 size-5 shrink-0 text-terracota" /><a className="underline underline-offset-4" href={`tel:${TIENDA.telefono.replace(/\s/g, '')}`}>{TIENDA.telefono}</a></li>}
              {TIENDA.email && <li className="flex gap-2.5"><Icono nombre="correo" className="mt-0.5 size-5 shrink-0 text-terracota" /><a className="underline underline-offset-4" href={`mailto:${TIENDA.email}`}>{TIENDA.email}</a></li>}
              <li className="flex gap-2.5"><Icono nombre="facebook" className="mt-0.5 size-5 shrink-0 text-terracota" /><a className="underline underline-offset-4" href={TIENDA.facebook} target="_blank" rel="noopener noreferrer">Facebook: La Tienda de Pocho<span className="sr-only"> (se abre en una pestaña nueva)</span></a></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
