import { useId } from 'react';
import Icono from './Icono.jsx';

// Campo de formulario accesible: etiqueta enlazada, ayuda y error con aria-describedby.
export default function Campo({ etiqueta, error, ayuda, multilinea = false, className = '', ...props }) {
  const id = useId();
  const idMsg = `${id}-msg`;
  const Control = multilinea ? 'textarea' : 'input';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {etiqueta}
        {props.required && <span className="text-azul"> *</span>}
      </label>
      <Control
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || ayuda ? idMsg : undefined}
        className={`block w-full rounded-xl border bg-blanco px-4 py-2.5 text-base text-noche placeholder:text-noche-suave/70 ${
          error ? 'border-azul ring-1 ring-azul' : 'border-durazno-oscuro hover:border-noche-suave'
        } ${multilinea ? 'min-h-32' : 'min-h-11'}`}
        {...props}
      />
      {(error || ayuda) && (
        <p id={idMsg} role={error ? 'alert' : undefined} className={`mt-1 flex items-start gap-1.5 text-sm ${error ? 'font-medium text-azul-oscuro' : 'text-noche-suave'}`}>
          {error && <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" />}
          <span>{error || ayuda}</span>
        </p>
      )}
    </div>
  );
}
