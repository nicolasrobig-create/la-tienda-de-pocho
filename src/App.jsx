import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';

// Cada página se descarga cuando se visita (el inicio y el catálogo son las más pesadas).
const Inicio = lazy(() => import('./pages/Inicio.jsx'));
const Catalogo = lazy(() => import('./pages/Catalogo.jsx'));
const Marca = lazy(() => import('./pages/Marca.jsx'));
const Producto = lazy(() => import('./pages/Producto.jsx'));
const Carrito = lazy(() => import('./pages/Carrito.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const PedidoConfirmado = lazy(() => import('./pages/PedidoConfirmado.jsx'));
const Contacto = lazy(() => import('./pages/Contacto.jsx'));
const Nosotros = lazy(() => import('./pages/Nosotros.jsx'));
const Envios = lazy(() => import('./pages/Envios.jsx'));
const NoEncontrada = lazy(() => import('./pages/NoEncontrada.jsx'));

export default function App() {
  return (
    <CarritoProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="marca/:slug" element={<Marca />} />
          <Route path="producto/:id" element={<Producto />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="pedido-confirmado" element={<PedidoConfirmado />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="envios-y-devoluciones" element={<Envios />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </CarritoProvider>
  );
}
