import { useEffect, useRef, useState } from 'react';
import Boton from '../ui/Boton.jsx';
import Icono from '../ui/Icono.jsx';
import { PORTADA as P } from '../../config/portada';
import { TIENDA } from '../../config/store';

// Portada animada: el scroll recorre un video fijo cuadro a cuadro y los textos se funden encima.
// En móvil el video cubre toda la pantalla. El encabezado (Header.jsx) flota encima. Textos, botones, videos y tiempos: src/config/portada.ts. Colores: tokens cielo / tinta / fondo de src/index.css.
//
// Cómo funciona:
// - El video tiene todos sus cuadros como keyframes (ffmpeg -g 1): puede saltar a cualquiera al instante.
// - Se baja entero como blob, después de que la página cargó: buscar dentro de un blob es casi inmediato,
//   mientras que pedir rangos por red se ve como una presentación de diapositivas.
// - El tiempo del video se acerca al objetivo con suavizado (0,115 por cuadro) en vez de saltar.
// - Entre un texto y el siguiente hay zonas muertas (solo video): nunca se leen dos a la vez.
// - Los textos se animan desde JS en cada cuadro, no con transiciones CSS ni IntersectionObserver.
// - Con movimiento reducido, ahorro de datos o si el video falla: dos tarjetas fijas con las imágenes.

const acotar = (v, a, b) => Math.min(b, Math.max(a, v));
const suave = (t) => t * t * (3 - 2 * t);
const rampa = (p, a, b) => (b <= a ? (p >= b ? 1 : 0) : suave(acotar((p - a) / (b - a), 0, 1)));

const FACTOR = 0.18; // cuánto se acerca el video al objetivo en cada cuadro
const DERIVA = 18; // px que se desplaza cada texto al entrar y salir

const WA = /^\d{8,}$/.test(TIENDA.whatsapp) ? `https://wa.me/${TIENDA.whatsapp}` : '';

const iniciarEstatico = () => {
  if (typeof window === 'undefined') return false;
  const ahorro = navigator.connection?.saveData === true;
  return ahorro || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ── Piezas de contenido ─────────────────────────────────────────

const Flecha = () => (
  <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-tinta text-fondo"><Icono nombre="flecha" className="size-4" /></span>
);

function BotonPrincipal({ boton, className = '' }) { // el display lo decide el contenedor, no el botón
  return <Boton to={boton.to} variante="crema" className={`pointer-events-auto min-h-12 pr-2.5 pl-6 ${className}`}>{boton.texto} <Flecha /></Boton>;
}

function TarjetaWhatsApp({ className = '' }) {
  if (!WA) return null;
  const t = P.pantalla1.tarjeta;
  return (
    <a href={WA} target="_blank" rel="noopener noreferrer" className={`pointer-events-auto flex items-center gap-3 rounded-2xl bg-fondo p-2 pr-4 text-tinta shadow-elevada motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 ${className}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-durazno"><Icono nombre="whatsapp" className="size-6" /></span>
      <span className="text-sm leading-tight"><strong className="block font-bold">{t.titulo}</strong><span className="text-noche-suave">{t.texto}</span></span>
    </a>
  );
}

// ── Pantallas (se posicionan dentro de la tarjeta; ref para animarlas desde JS) ──

function Pantalla1({ ref }) {
  const c = P.pantalla1;
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-20 will-change-[opacity,transform]">
      {/* Móvil: tarjeta crema abajo, sobre el video a pantalla completa. Escritorio: columna izquierda sin fondo. */}
      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2.5 rounded-[1.5rem] bg-fondo/90 p-4 shadow-elevada backdrop-blur-md md:inset-x-auto md:inset-y-0 md:left-0 md:w-[min(40rem,54%)] md:justify-center md:gap-5 md:rounded-none md:bg-transparent md:px-12 md:pt-24 md:pb-0 md:shadow-none md:backdrop-blur-none">
        <p className="hidden w-fit items-center gap-2 rounded-boton bg-fondo px-3.5 py-1.5 text-sm font-semibold text-tinta shadow-tarjeta md:inline-flex">
          <Icono nombre="pin" className="size-4" /> {c.etiqueta}
        </p>
        <h1 className="text-[1.6rem] leading-[1.08] text-balance text-tinta sm:text-3xl md:text-5xl lg:text-6xl">{c.titulo}</h1>
        <p className="max-w-md text-[0.9375rem] leading-snug text-tinta md:text-lg">{c.texto}</p>
        <BotonPrincipal boton={c.boton} className="w-full md:w-fit" />
      </div>
      {/* Móvil: la tarjeta de WhatsApp flota arriba a la derecha, bajo la barra */}
      <div className="absolute top-[4.75rem] right-3 md:hidden"><TarjetaWhatsApp /></div>
      {/* Escritorio: dos frases a la derecha y la tarjeta de WhatsApp abajo */}
      <ul className="absolute top-24 right-8 hidden w-64 flex-col gap-2.5 md:flex lg:right-12">
        {c.datos.map((d) => <li key={d} className="rounded-2xl bg-fondo/90 px-4 py-3 text-sm leading-snug text-tinta shadow-tarjeta backdrop-blur-sm">{d}</li>)}
      </ul>
      <div className="absolute right-8 bottom-9 hidden md:block lg:right-12"><TarjetaWhatsApp /></div>
    </div>
  );
}

function Transicion({ ref }) {
  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-20 flex justify-center px-4 opacity-0 invisible will-change-[opacity,transform] md:bottom-12">
      <p className="rounded-boton bg-fondo px-5 py-2.5 text-center font-display text-lg font-bold text-tinta shadow-elevada md:px-8 md:py-3.5 md:text-3xl">{P.transicion.texto}</p>
    </div>
  );
}

function Pantalla2({ ref, oculta = false }) {
  const c = P.pantalla2;
  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 z-20 will-change-[opacity,transform] ${oculta ? 'opacity-0 invisible' : ''}`}>
      {/* Móvil: tarjeta crema abajo. Escritorio: columna derecha (el plato queda abajo a la izquierda). */}
      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2.5 rounded-[1.5rem] bg-fondo/90 p-4 shadow-elevada backdrop-blur-md md:inset-x-auto md:inset-y-0 md:right-0 md:left-auto md:w-[min(34rem,46%)] md:justify-center md:gap-5 md:rounded-none md:bg-transparent md:px-12 md:pb-0 md:shadow-none md:backdrop-blur-none">
        <h2 className="text-[1.6rem] leading-[1.08] text-balance text-tinta sm:text-3xl md:text-5xl lg:text-6xl">{c.titulo}</h2>
        <p className="text-[0.9375rem] leading-snug text-tinta md:max-w-sm md:text-lg">{c.texto}</p>
        <div className="flex flex-wrap gap-3">
          <BotonPrincipal boton={c.boton} className="w-full md:w-auto" />
          <div className="hidden md:block">
            <Boton to={c.botonSecundario.to} variante="tinta" className="pointer-events-auto min-h-12 px-6">{c.botonSecundario.texto}</Boton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ventana del video: ocupa toda la tarjeta (en móvil, toda la pantalla; el video se amplía y recorta para cubrirla) ──

const VENTANA = 'absolute inset-0 overflow-hidden bg-cielo';

// `posicion`: encuadre en móvil, donde el video horizontal se recorta (Bruno a la derecha del centro, el plato a la izquierda).
function Poster({ poster, prioridad = false, posicion = 'object-[61%_50%]' }) {
  return (
    <img
      src={poster.src}
      srcSet={poster.srcSet}
      sizes="100vw"
      width={1280}
      height={720}
      alt=""
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={`absolute inset-0 size-full object-cover ${posicion} md:object-center`}
    />
  );
}

// ── Versión sin animación: dos tarjetas con la primera y la última imagen ──

function PortadaEstatica() {
  const tarjeta = 'relative h-[100svh] min-h-[34rem] overflow-hidden bg-fondo md:h-[38rem] md:rounded-[1.75rem]';
  return (
    <section aria-label="Portada" className="grid gap-0 p-0 md:gap-3 md:p-3">
      <div className={tarjeta}>
        <div className={VENTANA}><Poster poster={P.posters.inicio} prioridad /></div>
        <Pantalla1 />
      </div>
      <div className={tarjeta}>
        <div className={VENTANA}><Poster poster={P.posters.plato} posicion="object-[20%_50%]" /></div>
        <Pantalla2 />
      </div>
    </section>
  );
}

// ── Versión animada ──

export default function Portada() {
  const [estatico, setEstatico] = useState(iniciarEstatico);
  const [listo, setListo] = useState(false);
  const pista = useRef(null);
  const escenario = useRef(null);
  const clip = useRef(null);
  const p1 = useRef(null);
  const cap = useRef(null);
  const p2 = useRef(null);
  const barra = useRef(null);
  const carga = useRef(null);

  useEffect(() => {
    if (estatico) return undefined;
    const elPista = pista.current;
    const elEscenario = escenario.current;
    const video = clip.current;
    const movil = window.matchMedia('(max-width: 767px)');
    const paneles = [[p1, P.zonas.pantalla1], [cap, P.zonas.transicion], [p2, P.zonas.pantalla2]];

    let progreso = 0;
    let objetivo = 0; // segundo del video al que apunta el scroll
    let actual = 0; // segundo que se muestra (suavizado)
    let duracion = 0;
    let conectado = false;
    let activo = true;
    let raf = 0;
    let urlBlob = '';

    // El escenario es sticky arriba de todo: el progreso corre mientras la pista lo sostiene.
    const medir = () => {
      const r = elPista.getBoundingClientRect();
      const recorrido = r.height - elEscenario.offsetHeight;
      progreso = recorrido > 0 ? acotar(-r.top / recorrido, 0, 1) : 0;
      if (duracion) objetivo = progreso * duracion;
    };

    const pintar = () => {
      if (barra.current) barra.current.style.transform = `scaleX(${progreso})`;
      for (const [ref, c] of paneles) {
        const el = ref.current;
        if (!el) continue;
        const entra = rampa(progreso, c[0], c[1]);
        const sale = rampa(progreso, c[2], c[3]);
        const o = entra * (1 - sale);
        el.style.opacity = o;
        el.style.transform = `translate3d(0, ${(1 - entra) * DERIVA - sale * DERIVA}px, 0)`;
        el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      }
      // En móvil el video horizontal se amplía para cubrir la pantalla y solo se ve una franja: Bruno está un poco a la
      // derecha del centro (61 %), la croqueta al centro (50 %) y el plato a la izquierda (20 %).
      video.style.objectPosition = movil.matches ? `${61 - 11 * rampa(progreso, 0, 0.3) - 30 * rampa(progreso, 0.58, 0.78)}% 50%` : '50% 50%';
    };

    const cuadro = () => {
      raf = 0;
      let sigue = false;
      if (duracion) {
        const dif = objetivo - actual;
        if (Math.abs(dif) > 0.0008) {
          actual += dif * FACTOR;
          sigue = true;
          if (video.readyState >= 2 && !video.seeking) {
            try { video.currentTime = actual; } catch { /* el video aún no admite buscar */ }
          }
        }
      }
      pintar();
      if (sigue && activo) raf = requestAnimationFrame(cuadro);
    };
    const pedir = () => { if (!raf && activo) raf = requestAnimationFrame(cuadro); };
    const alScroll = () => { medir(); pedir(); };

    const conectar = (src) => {
      if (conectado || !activo) return;
      conectado = true;
      video.addEventListener('loadedmetadata', () => {
        duracion = video.duration || 0;
        video.pause();
        medir();
        actual = objetivo;
        try { video.currentTime = actual; } catch { /* idem */ }
        setListo(true);
        pedir();
      }, { once: true });
      // Si un cuadro quedó atrás porque el video estaba buscando, lo corrige
      video.addEventListener('seeked', () => {
        if (Math.abs(video.currentTime - actual) > 0.015) { try { video.currentTime = actual; } catch { /* idem */ } }
      });
      video.addEventListener('error', () => { if (activo) setEstatico(true); }, { once: true });
      video.src = src;
      video.load();
    };

    const cargar = async () => {
      const url = movil.matches ? P.video.movil : P.video.escritorio;
      try {
        const res = await fetch(url);
        if (!res.ok || !res.body) throw new Error('sin cuerpo');
        const total = Number(res.headers.get('content-length')) || 0;
        const lector = res.body.getReader();
        const trozos = [];
        let leido = 0;
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          trozos.push(value);
          leido += value.length;
          if (total && carga.current) carga.current.style.transform = `scaleX(${leido / total})`;
        }
        if (!activo) return;
        urlBlob = URL.createObjectURL(new Blob(trozos, { type: 'video/mp4' }));
        conectar(urlBlob);
      } catch {
        conectar(url); // sin CORS, sin red o bloqueado: que el navegador lo pida directamente
      }
    };

    // Se baja cuando la página ya cargó, para no competir con la imagen principal ni con el resto.
    let idle = 0;
    const arrancar = () => { idle = window.requestIdleCallback ? window.requestIdleCallback(cargar, { timeout: 4000 }) : window.setTimeout(cargar, 1500); };
    if (document.readyState === 'complete') arrancar(); else window.addEventListener('load', arrancar, { once: true });

    // iOS no pinta cuadros de un video que nunca se reprodujo: un play/pause en la primera interacción
    const desbloquear = () => {
      const r = video.play();
      if (r?.then) r.then(() => video.pause()).catch(() => {}); else video.pause();
    };
    const eventos = ['touchstart', 'pointerdown', 'wheel', 'keydown'];
    eventos.forEach((e) => window.addEventListener(e, desbloquear, { once: true, passive: true }));

    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);

    medir();
    pintar();

    return () => {
      activo = false;
      cancelAnimationFrame(raf);
      window.cancelIdleCallback?.(idle);
      window.clearTimeout(idle);
      window.removeEventListener('load', arrancar);
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
      eventos.forEach((e) => window.removeEventListener(e, desbloquear));
      if (urlBlob) URL.revokeObjectURL(urlBlob);
    };
  }, [estatico]);

  if (estatico) return <PortadaEstatica />;

  return (
    <section ref={pista} aria-label="Portada" className="relative" style={{ height: `${P.alturaPista * 100}svh` }}>
      <div ref={escenario} className="sticky top-0 h-[100svh] min-h-[34rem] p-0 md:p-3">
        <div className="relative h-full overflow-hidden bg-fondo md:rounded-[1.75rem]">
          <div className={VENTANA}>
            <Poster poster={P.posters.inicio} prioridad />
            <video
              ref={clip}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              tabIndex={-1}
              aria-hidden="true"
              className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${listo ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
          <Pantalla1 ref={p1} />
          <Transicion ref={cap} />
          <Pantalla2 ref={p2} oculta />
          {/* Progreso de la animación y, mientras baja el video, avance de la descarga */}
          <div aria-hidden="true" className="absolute inset-x-5 bottom-1.5 z-30 h-1 overflow-hidden rounded-full bg-tinta/15 md:inset-x-8 md:bottom-3">
            <i ref={barra} className="block size-full origin-left scale-x-0 bg-tinta/60" />
          </div>
          {!listo && (
            <div aria-hidden="true" className="absolute inset-x-0 top-0 z-30 h-1 bg-tinta/10">
              <i ref={carga} className="block size-full origin-left scale-x-0 bg-cielo" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
