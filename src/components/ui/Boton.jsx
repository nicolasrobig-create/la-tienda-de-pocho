import { Link } from 'react-router-dom';

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-boton px-5 text-base font-semibold ' +
  'transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const VARIANTES = {
  primario: 'bg-azul text-blanco shadow-tarjeta hover:bg-azul-oscuro hover:shadow-elevada disabled:hover:bg-azul',
  secundario: 'border-2 border-azul bg-transparent text-azul hover:bg-azul hover:text-blanco',
  suave: 'bg-durazno text-noche hover:bg-durazno-oscuro',
  fantasma: 'px-3 text-azul-oscuro hover:bg-durazno',
  ambar: 'bg-ambar text-noche shadow-tarjeta hover:bg-fondo hover:shadow-elevada',
  claro: 'border-2 border-fondo bg-transparent text-fondo hover:bg-fondo hover:text-noche',
};

// Renderiza <Link> si recibe `to`, <a> si recibe `href` y <button> en otro caso.
export default function Boton({ variante = 'primario', to, href, className = '', children, ...props }) {
  const clases = `${BASE} ${VARIANTES[variante]} ${className}`;
  if (to) return <Link to={to} className={clases} {...props}>{children}</Link>;
  if (href) return <a href={href} className={clases} {...props}>{children}</a>;
  return <button type="button" className={clases} {...props}>{children}</button>;
}
