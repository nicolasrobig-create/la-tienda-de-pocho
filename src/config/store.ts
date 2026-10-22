// Configuración de la tienda: único lugar para datos de contacto, WhatsApp y zonas de envío.
// Los campos vacíos no se muestran en el sitio.
// Mantener solo sintaxis "borrable" de TypeScript (interfaces y tipos): este archivo también
// lo lee Node directamente en scripts/postbuild.js.

export interface Tienda {
  nombre: string;
  ciudad: string;
  cobertura: string;
  facebook: string;
  /** Dirección pública del sitio. Si queda vacía, el build usa SITE_URL o la URL que dé Vercel/Netlify. */
  url: string;
  /**
   * Número de WhatsApp donde llegan los pedidos: solo dígitos, con indicativo de país (Colombia = 57).
   * Ejemplo: '573001234567'. Con el valor '[NÚMERO DE WHATSAPP]' (o vacío) el checkout NO abre
   * WhatsApp: muestra la confirmación del pedido para copiarlo y enviarlo por otro canal.
   */
  whatsapp: string;
  telefono: string;
  email: string;
  direccion: string;
  horario: string;
  /**
   * Zonas, barrios o localidades donde NO se entrega. El checkout rechaza una dirección que
   * contenga alguna de estas palabras y la página de Envíos las lista. Ejemplo: ['Sumapaz', 'Usme'].
   */
  zonasExcluidas: string[];
}

export const TIENDA: Tienda = {
  nombre: 'La Tienda de Pocho',
  ciudad: 'Bogotá, Colombia',
  cobertura: 'Bogotá',
  facebook: 'https://www.facebook.com/LaTiendadePocho/',
  url: '',
  whatsapp: '573015885529',
  telefono: '301-588-5529',
  email: 'latiendadepocho08@gmail.com',
  direccion: 'Carrera 69 #98-29',
  horario: 'Lun a Sáb 9:00 a.m. – 8:00 p.m. · Dom 9:00 a.m. – 7:00 p.m.',
  zonasExcluidas: [],
};
