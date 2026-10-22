import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import AvisoAgregado from './AvisoAgregado.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// Alto mínimo: evita que el pie de página aparezca a media pantalla y luego salte hacia abajo (CLS).
function CargandoPagina() {
  return (
    <div className="contenedor min-h-[100dvh] py-10" role="status" aria-label="Cargando página">
      <div className="esqueleto mb-6 h-9 w-2/3 max-w-md rounded-xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="esqueleto aspect-[4/5] rounded-tarjeta" />)}
      </div>
    </div>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const principal = useRef(null);
  const anterior = useRef(pathname);

  // Al cambiar de página: sube al inicio (o al ancla) y mueve el foco al contenido
  // para que teclado y lectores de pantalla empiecen desde ahí.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
    // Solo si cambió de página (no en la carga inicial ni en la doble ejecución de StrictMode).
    if (anterior.current !== pathname) {
      anterior.current = pathname;
      principal.current?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-boton focus:bg-cacao focus:px-5 focus:py-3 focus:font-semibold focus:text-crema"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" ref={principal} tabIndex={-1} className="outline-none">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<CargandoPagina />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <AvisoAgregado />
    </>
  );
}
