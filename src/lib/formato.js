const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

export const formatearPrecio = (valor) => (valor == null ? 'Consultar precio' : formatoCOP.format(valor));

// Minúsculas sin tildes, para comparar texto de búsqueda.
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const pluralizar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

export const nombreAnimal = (tipoAnimal) => (tipoAnimal === 'felino' ? 'gatos' : 'perros');
