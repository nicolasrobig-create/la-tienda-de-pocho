import fotos from '../../data/fotos.json';

// Foto real de la tienda (public/fotos/<nombre>-<ancho>.webp, generadas con `npm run fotos`).
// Pasa `prioridad` solo en lo que se ve al abrir la página; el resto carga al acercarse.
export default function Foto({ nombre, alt, sizes, prioridad = false, className = '', ...props }) {
  const f = fotos[nombre];
  if (!f) return null;
  const url = (ancho) => `/fotos/${nombre}-${ancho}.webp`;
  return (
    <img
      src={url(f.anchos.at(-1))}
      srcSet={f.anchos.map((a) => `${url(a)} ${a}w`).join(', ')}
      sizes={sizes}
      width={f.ancho}
      height={f.alto}
      alt={alt}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={`object-cover ${className}`}
      {...props}
    />
  );
}
