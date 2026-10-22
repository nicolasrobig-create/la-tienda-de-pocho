// Íconos de línea (24×24, trazo currentColor). Decorativos por defecto: el texto o aria-label
// del elemento que los contiene da el significado.
const RUTAS = {
  buscar: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  carrito: <><path d="M3 4h2.2l2.1 10.5a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L19.5 8H6.1" /><circle cx="9.5" cy="19.5" r="1.3" /><circle cx="16.5" cy="19.5" r="1.3" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  papelera: <><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" /></>,
  facebook: <path d="M14.5 8.5V7c0-.8.4-1.2 1.2-1.2H17.5V3H15c-2.5 0-3.8 1.5-3.8 3.8v1.7H9v3h2.2V21h3.3v-9.5h2.4l.4-3h-2.8z" />,
  pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z" /><circle cx="12" cy="10" r="2.3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerta: <><path d="M12 4 2.8 19.5h18.4z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.1" /></>,
  flecha: <path d="M5 12h14m-5-5 5 5-5 5" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  filtro: <path d="M4 6h16M7 12h10M10 18h4" />,
  zoom: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5" /></>,
  camion: <><path d="M3 6.5h11v9H3zM14 9.5h3.8l2.7 3v3H14" /><circle cx="7.5" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></>,
  escudo: <><path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  corazon: <path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z" />,
  whatsapp: <><path d="M4 20l1.2-4.2A8 8 0 1 1 8.3 18.9z" /><path d="M9.2 8.8c.3 2.2 2.3 4.3 4.6 4.9l1.3-1.2-1.8-1-.8.7c-.8-.4-1.5-1.1-1.9-1.9l.7-.8-1-1.8z" /></>,
  telefono: <path d="M6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4 5.5a2 2 0 0 1 2-2z" />,
  correo: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  reloj: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  caja: <><path d="M4 8 12 4l8 4v8l-8 4-8-4z" /><path d="m4 8 8 4 8-4M12 12v8" /></>,
};

export default function Icono({ nombre, className = 'size-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {RUTAS[nombre]}
    </svg>
  );
}
