import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { obtenerProducto } from '../lib/datos.js';

// El carrito guarda solo { id, cantidad }. Nombre, foto y precio se leen del catálogo
// en cada render, así un cambio en precios.json se refleja sin vaciar el carrito.
const CLAVE = 'pocho:carrito:v1';
export const CANTIDAD_MAX = 20;

const limitar = (n) => Math.min(CANTIDAD_MAX, Math.max(1, Math.round(Number(n) || 1)));

function leerGuardado() {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];
    // Descarta ítems corruptos o de productos que ya no existen.
    return datos
      .filter((i) => i && typeof i.id === 'string' && obtenerProducto(i.id))
      .map((i) => ({ id: i.id, cantidad: limitar(i.cantidad) }));
  } catch {
    return []; // modo privado, almacenamiento bloqueado o JSON dañado
  }
}

function guardar(items) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    /* sin almacenamiento: el carrito sigue funcionando en memoria */
  }
}

function reductor(items, accion) {
  switch (accion.tipo) {
    case 'agregar': {
      const existente = items.find((i) => i.id === accion.id);
      if (existente) {
        return items.map((i) => (i.id === accion.id ? { ...i, cantidad: limitar(i.cantidad + accion.cantidad) } : i));
      }
      return [...items, { id: accion.id, cantidad: limitar(accion.cantidad) }];
    }
    case 'cambiar':
      return items.map((i) => (i.id === accion.id ? { ...i, cantidad: limitar(accion.cantidad) } : i));
    case 'quitar':
      return items.filter((i) => i.id !== accion.id);
    case 'vaciar':
      return [];
    case 'reemplazar':
      return accion.items;
    default:
      return items;
  }
}

const Contexto = createContext(null);

export function CarritoProvider({ children }) {
  const [items, despachar] = useReducer(reductor, undefined, leerGuardado);
  const [aviso, setAviso] = useState(null); // último producto agregado (para el aviso emergente)

  useEffect(() => guardar(items), [items]);

  // Sincroniza varias pestañas abiertas.
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === CLAVE) despachar({ tipo: 'reemplazar', items: leerGuardado() });
    };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  const agregar = useCallback((id, cantidad = 1) => {
    const producto = obtenerProducto(id);
    if (!producto || !producto.stock) return;
    despachar({ tipo: 'agregar', id, cantidad });
    setAviso({ clave: Date.now(), producto, cantidad });
  }, []);
  const cambiarCantidad = useCallback((id, cantidad) => despachar({ tipo: 'cambiar', id, cantidad }), []);
  const quitar = useCallback((id) => despachar({ tipo: 'quitar', id }), []);
  const vaciar = useCallback(() => despachar({ tipo: 'vaciar' }), []);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  const valor = useMemo(() => {
    const lineas = items.map((i) => {
      const producto = obtenerProducto(i.id);
      return {
        ...i,
        producto,
        subtotal: producto.precio == null ? null : producto.precio * i.cantidad,
      };
    });
    return {
      lineas,
      totalUnidades: items.reduce((s, i) => s + i.cantidad, 0),
      total: lineas.reduce((s, l) => s + (l.subtotal ?? 0), 0),
      hayPorConsultar: lineas.some((l) => l.subtotal == null),
      cantidadDe: (id) => items.find((i) => i.id === id)?.cantidad ?? 0,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      aviso,
      cerrarAviso,
    };
  }, [items, aviso, agregar, cambiarCantidad, quitar, vaciar, cerrarAviso]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return ctx;
}
