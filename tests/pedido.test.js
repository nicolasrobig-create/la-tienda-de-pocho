// Pruebas unitarias de la lógica del pedido. Correr con: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  construirMensaje, crearCodigo, numeroWhatsApp, resumirLineas, telefonoValido,
  urlWhatsApp, validarPedido, zonaExcluida,
} from '../src/lib/pedido.js';
import { formatearPrecio, normalizar } from '../src/lib/formato.js';
import { aplicarCambios, filtrar, leerFiltros, ordenar } from '../src/lib/filtros.js';

const valido = { nombre: 'Ana Pérez', telefono: '300 123 4567', direccion: 'Carrera 69 #98-29', barrio: 'Colina Campestre', notas: '' };

test('numeroWhatsApp: acepta dígitos y rechaza el marcador o vacío', () => {
  assert.equal(numeroWhatsApp('573015885529'), '573015885529');
  assert.equal(numeroWhatsApp('+57 301 588 5529'), '573015885529');
  assert.equal(numeroWhatsApp('[NÚMERO DE WHATSAPP]'), null);
  assert.equal(numeroWhatsApp(''), null);
  assert.equal(numeroWhatsApp('12345'), null);
});

test('telefonoValido: celulares y fijos de Bogotá', () => {
  for (const ok of ['3001234567', '300 123 4567', '+57 300 123 4567', '573001234567', '6011234567', '2345678']) assert.ok(telefonoValido(ok), ok);
  for (const mal of ['', 'abc', '1234567890', '30012345', '300123456789']) assert.ok(!telefonoValido(mal), mal);
});

test('validarPedido: datos correctos no tienen errores', () => {
  assert.deepEqual(validarPedido(valido), {});
});

test('validarPedido: campos vacíos y cortos dan un error claro cada uno', () => {
  const e = validarPedido({ nombre: '', telefono: '', direccion: 'Cll', barrio: '', notas: '' });
  assert.deepEqual(Object.keys(e).sort(), ['barrio', 'direccion', 'nombre', 'telefono']);
  assert.match(e.telefono, /teléfono/);
});

test('validarPedido: notas demasiado largas', () => {
  assert.ok(validarPedido({ ...valido, notas: 'x'.repeat(301) }).notas);
});

test('zonas excluidas: ignora tildes y mayúsculas', () => {
  assert.equal(zonaExcluida('Vereda de Sumapaz', ['sumapaz']), 'sumapaz');
  assert.equal(zonaExcluida('Usmé', ['USME']), 'USME');
  assert.equal(zonaExcluida('Chapinero', ['Usme']), null);
  assert.equal(zonaExcluida('Chapinero', ['']), null);
  const e = validarPedido({ ...valido, barrio: 'Usme centro' }, ['Usme']);
  assert.match(e.barrio, /no hacemos entregas en Usme/);
});

test('crearCodigo: formato estable', () => {
  assert.match(crearCodigo(), /^P-[0-9A-Z]{5}$/);
  assert.equal(crearCodigo(() => 0, () => 0), 'P-00000');
});

test('construirMensaje: incluye detalle, total, datos y notas; sin saltos raros', () => {
  const lineas = resumirLineas([
    { cantidad: 2, subtotal: 156000, producto: { id: 'a', marca: "Hill's", nombre: 'Adulto Indoor', presentacion: '3,5 lb', precio: 78000 } },
    { cantidad: 1, subtotal: null, producto: { id: 'b', marca: 'X', nombre: 'Sin precio', presentacion: '1 kg', precio: null } },
  ]);
  const m = construirMensaje({
    codigo: 'P-ABCDE', tienda: 'La Tienda de Pocho', lineas, total: 156000, hayPorConsultar: true,
    cliente: { ...valido, nombre: '  Ana\n  Pérez ', notas: 'Portería, torre 2' },
  });
  assert.match(m, /^\*Pedido P-ABCDE · La Tienda de Pocho\*/);
  assert.match(m, /1\. Hill's Adulto Indoor \(3,5 lb\) × 2 — \$\s156\.000/);
  assert.match(m, /2\. X Sin precio \(1 kg\) × 1 — precio por consultar/);
  assert.match(m, /sin los productos por consultar/);
  assert.match(m, /Nombre: Ana Pérez\n/);
  assert.match(m, /Notas: Portería, torre 2/);
  assert.doesNotMatch(m, /Notas:.*\n.*Notas:/);
});

test('construirMensaje: sin notas no agrega la línea', () => {
  const m = construirMensaje({ codigo: 'P-1', tienda: 'T', lineas: [], total: 0, hayPorConsultar: false, cliente: valido });
  assert.doesNotMatch(m, /Notas:/);
});

test('urlWhatsApp: codifica el mensaje', () => {
  const u = urlWhatsApp('573001234567', 'Hola & chao\nlínea 2');
  assert.ok(u.startsWith('https://wa.me/573001234567?text='));
  assert.ok(!u.includes('\n') && !u.includes(' '));
  assert.equal(decodeURIComponent(u.split('text=')[1]), 'Hola & chao\nlínea 2');
});

test('formatearPrecio: COP sin decimales y "Consultar precio" si es null', () => {
  assert.match(formatearPrecio(45000), /^\$\s45\.000$/);
  assert.equal(formatearPrecio(null), 'Consultar precio');
});

test('filtros: búsqueda sin tildes, rango de precio y orden', () => {
  const items = [
    { id: '1', marca: 'A', nombre: 'Salmón', presentacion: '1 kg', etiquetas: ['gatos'], tipoAnimal: 'felino', slugMarca: 'a', precio: 30000, pesoKg: 1, orden: 0 },
    { id: '2', marca: 'B', nombre: 'Urinary', presentacion: '3 kg', etiquetas: ['gatos', 'cuidado urinario'], tipoAnimal: 'felino', slugMarca: 'b', precio: 90000, pesoKg: 3, orden: 1 },
    { id: '3', marca: 'C', nombre: 'Perro', presentacion: '2 kg', etiquetas: ['perros'], tipoAnimal: 'canino', slugMarca: 'c', precio: null, pesoKg: 2, orden: 2 },
  ];
  const f = (q) => leerFiltros(new URLSearchParams(q));
  assert.deepEqual(filtrar(items, f('q=salmon')).map((p) => p.id), ['1']);
  assert.deepEqual(filtrar(items, f('min=50000')).map((p) => p.id), ['2']); // sin precio queda fuera
  assert.deepEqual(filtrar(items, f('animal=perro')).map((p) => p.id), ['3']);
  assert.deepEqual(ordenar(items, 'precio-asc').map((p) => p.id), ['1', '2', '3']);
  assert.deepEqual(ordenar(items, 'precio-desc').map((p) => p.id), ['2', '1', '3']);
  assert.deepEqual(ordenar(items, 'novedades').map((p) => p.id), ['3', '2', '1']);
  assert.equal(aplicarCambios(new URLSearchParams('a=1'), { a: '', b: ['x', 'y'] }).toString(), 'b=x&b=y');
  assert.equal(normalizar('  ÁÉÍ '), 'aei');
});
