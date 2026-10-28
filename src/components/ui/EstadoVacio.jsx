import Icono from './Icono.jsx';

export default function EstadoVacio({ icono = 'caja', titulo, children, acciones, principal = false }) {
  const Titulo = principal ? 'h1' : 'h2';
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-tarjeta border border-dashed border-durazno-oscuro bg-durazno/50 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-durazno text-azul">
        <Icono nombre={icono} className="size-7" />
      </span>
      <Titulo className="text-2xl">{titulo}</Titulo>
      {children && <p className="text-noche-suave">{children}</p>}
      {acciones && <div className="mt-2 flex flex-wrap justify-center gap-3">{acciones}</div>}
    </div>
  );
}
