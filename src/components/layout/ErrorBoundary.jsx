import { Component } from 'react';
import EstadoVacio from '../ui/EstadoVacio.jsx';
import Boton from '../ui/Boton.jsx';

// Evita la pantalla en blanco si una página falla al renderizar o al cargar su código.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="contenedor py-16">
        <EstadoVacio
          principal
          icono="alerta"
          titulo="Algo no salió bien"
          acciones={<Boton onClick={() => window.location.reload()}>Recargar la página</Boton>}
        >
          Tuvimos un problema al mostrar esta página. Recárgala o vuelve al inicio.
        </EstadoVacio>
      </div>
    );
  }
}
