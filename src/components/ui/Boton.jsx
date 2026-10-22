import { Link } from 'react-router-dom';

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-boton px-5 text-base font-semibold ' +
  'transition-colors duration-200 motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTES = {
  primario: 'bg-terracota text-blanco hover:bg-terracota-oscura disabled:hover:bg-terracota',
  secundario: 'border-2 border-cacao bg-transparent text-cacao hover:bg-cacao hover:text-crema',
  suave: 'bg-arena text-cacao hover:bg-arena-oscura',
  fantasma: 'px-3 text-terracota-oscura hover:bg-arena',
  miel: 'bg-miel text-cacao hover:bg-crema',
  claro: 'border-2 border-crema bg-transparent text-crema hover:bg-crema hover:text-cacao',
};

// Renderiza <Link> si recibe `to`, <a> si recibe `href` y <button> en otro caso.
export default function Boton({ variante = 'primario', to, href, className = '', children, ...props }) {
  const clases = `${BASE} ${VARIANTES[variante]} ${className}`;
  if (to) return <Link to={to} className={clases} {...props}>{children}</Link>;
  if (href) return <a href={href} className={clases} {...props}>{children}</a>;
  return <button type="button" className={clases} {...props}>{children}</button>;
}
