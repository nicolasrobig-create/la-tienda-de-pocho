import { useEffect, useRef } from 'react';

// Envoltorio del <dialog> nativo: trampa de foco, Escape y aria-modal vienen del navegador.
// `variante`: 'derecha' (panel lateral) o 'centro' (zoom de foto).
export default function Dialogo({ abierto, onCerrar, etiqueta, variante = 'derecha', children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return undefined;
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!abierto && dialogo.open) {
      dialogo.close();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-label={etiqueta}
      className={`panel panel-${variante}`}
      onClose={onCerrar}
      onClick={(e) => {
        // Clic en el fondo (el propio <dialog>, no su contenido) cierra.
        if (e.target === ref.current) onCerrar();
      }}
    >
      {abierto && children}
    </dialog>
  );
}
