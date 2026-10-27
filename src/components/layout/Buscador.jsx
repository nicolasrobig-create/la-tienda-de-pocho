import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icono from '../ui/Icono.jsx';

export default function Buscador({ id, className = '', onBuscar }) {
  const navegar = useNavigate();
  const { pathname, search } = useLocation();
  const qUrl = pathname === '/catalogo' ? new URLSearchParams(search).get('q') ?? '' : '';
  const [texto, setTexto] = useState(qUrl);

  // Si la búsqueda cambia desde otro lado (filtros, atrás), refleja el valor.
  useEffect(() => setTexto(qUrl), [qUrl]);

  const enviar = (e) => {
    e.preventDefault();
    const q = texto.trim();
    navegar(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo');
    onBuscar?.();
  };

  return (
    <form role="search" onSubmit={enviar} className={className}>
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <div className="relative">
        <Icono nombre="buscar" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-noche-suave" />
        <input
          id={id}
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar alimento, marca o necesidad"
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-11 w-full rounded-boton border border-durazno-oscuro bg-blanco py-2 pr-24 pl-11 text-base text-noche placeholder:text-noche-suave/80 hover:border-noche-suave"
        />
        <button
          type="submit"
          className="absolute top-1 right-1 bottom-1 rounded-boton bg-noche px-4 text-sm font-semibold text-fondo transition-colors hover:bg-azul"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
