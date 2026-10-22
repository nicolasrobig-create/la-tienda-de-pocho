// Lógica del pedido: validación, zonas excluidas y mensaje de WhatsApp.
// Son funciones puras (reciben la configuración por parámetro) para poder probarlas con `npm test`.
import { formatearPrecio, normalizar } from './formato.js';

export const LIMITES = { nombre: 80, direccion: 120, barrio: 60, notas: 300 };

// Quita caracteres de control y espacios repetidos.
export const limpiar = (texto) =>
  String(texto ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Número de WhatsApp utilizable: 10 a 15 dígitos. Con el marcador '[NÚMERO DE WHATSAPP]' o vacío → null.
export function numeroWhatsApp(configurado) {
  const digitos = String(configurado ?? '').replace(/\D/g, '');
  return /^\d{10,15}$/.test(digitos) ? digitos : null;
}

// Celular colombiano (10 dígitos que empiezan por 3) o fijo de Bogotá (7 dígitos, o 601 + 7). Acepta +57.
export function telefonoValido(texto) {
  let d = String(texto ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  return /^3\d{9}$/.test(d) || /^\d{7}$/.test(d) || /^601\d{7}$/.test(d);
}

// Devuelve la primera zona excluida que aparezca en el texto, o null.
export function zonaExcluida(texto, zonas = []) {
  const t = normalizar(texto);
  return zonas.find((z) => normalizar(z) && t.includes(normalizar(z))) ?? null;
}

export function validarPedido(valores, zonas = []) {
  const e = {};
  const nombre = limpiar(valores.nombre);
  if (nombre.length < 3) e.nombre = 'Escribe tu nombre completo.';
  else if (nombre.length > LIMITES.nombre) e.nombre = `Usa máximo ${LIMITES.nombre} caracteres.`;

  if (!limpiar(valores.telefono)) e.telefono = 'Escribe un teléfono para coordinar la entrega.';
  else if (!telefonoValido(valores.telefono)) e.telefono = 'Revisa el número: un celular tiene 10 dígitos, por ejemplo 3001234567.';

  const direccion = limpiar(valores.direccion);
  if (direccion.length < 6) e.direccion = 'Escribe la dirección completa, por ejemplo: Carrera 69 #98-29, apto 301.';
  else if (direccion.length > LIMITES.direccion) e.direccion = `Usa máximo ${LIMITES.direccion} caracteres.`;

  const barrio = limpiar(valores.barrio);
  if (barrio.length < 3) e.barrio = 'Cuéntanos el barrio o la localidad.';
  else if (barrio.length > LIMITES.barrio) e.barrio = `Usa máximo ${LIMITES.barrio} caracteres.`;

  if (limpiar(valores.notas).length > LIMITES.notas) e.notas = `Usa máximo ${LIMITES.notas} caracteres.`;

  const zona = zonaExcluida(`${barrio} ${direccion}`, zonas);
  if (zona && !e.barrio) e.barrio = `Por ahora no hacemos entregas en ${zona}. Escríbenos y vemos si hay otra opción.`;
  return e;
}

// Código corto para identificar el pedido en la conversación, ej. "P-7K3QX".
export function crearCodigo(azar = Math.random, ahora = Date.now) {
  const base = (ahora() % 1679616).toString(36).toUpperCase().padStart(4, '0');
  const sufijo = Math.floor(azar() * 36).toString(36).toUpperCase();
  return `P-${base}${sufijo}`;
}

// Fotografía del carrito: lo que se manda y se muestra no cambia aunque luego cambien los precios.
export function resumirLineas(lineas) {
  return lineas.map((l) => ({
    id: l.producto.id,
    marca: l.producto.marca,
    nombre: l.producto.nombre,
    presentacion: l.producto.presentacion,
    cantidad: l.cantidad,
    precio: l.producto.precio,
    subtotal: l.subtotal,
  }));
}

export function construirMensaje({ codigo, tienda, lineas, total, hayPorConsultar, cliente }) {
  const detalle = lineas.map((l, i) => {
    const precio = l.subtotal == null ? 'precio por consultar' : formatearPrecio(l.subtotal);
    return `${i + 1}. ${l.marca} ${l.nombre} (${l.presentacion}) × ${l.cantidad} — ${precio}`;
  });
  const filas = [
    `*Pedido ${codigo} · ${tienda}*`,
    'Hola, quiero hacer este pedido:',
    '',
    ...detalle,
    '',
    `*Total productos:* ${formatearPrecio(total)}${hayPorConsultar ? ' (sin los productos por consultar)' : ''}`,
    'Envío: por confirmar según mi zona.',
    '',
    '*Datos de entrega*',
    `Nombre: ${limpiar(cliente.nombre)}`,
    `Teléfono: ${limpiar(cliente.telefono)}`,
    `Dirección: ${limpiar(cliente.direccion)}`,
    `Barrio/Localidad: ${limpiar(cliente.barrio)}`,
  ];
  if (limpiar(cliente.notas)) filas.push(`Notas: ${limpiar(cliente.notas)}`);
  filas.push('', '¿Me confirman disponibilidad, costo de envío y forma de pago? Gracias.');
  return filas.join('\n');
}

export const urlWhatsApp = (numero, mensaje) => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
