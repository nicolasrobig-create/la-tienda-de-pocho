import { useSyncExternalStore } from 'react';

// true cuando la consulta CSS se cumple (se actualiza al redimensionar). Fuera del navegador devuelve false.
export function useMediaQuery(consulta) {
  const suscribir = (aviso) => {
    const mq = window.matchMedia(consulta);
    mq.addEventListener('change', aviso);
    return () => mq.removeEventListener('change', aviso);
  };
  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, () => false);
}
