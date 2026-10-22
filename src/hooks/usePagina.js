import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IMAGEN_OG_DEFECTO, NOMBRE_SITIO, tituloCompleto } from '../lib/seo.js';

function fijar(selector, atributo, valor, crear) {
  let el = document.head.querySelector(selector);
  if (!el) {
    if (!crear) return;
    el = document.createElement(crear.tag);
    for (const [k, v] of Object.entries(crear.attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute(atributo, valor);
}

const meta = (nombre, valor) => fijar(`meta[name="${nombre}"]`, 'content', valor, { tag: 'meta', attrs: { name: nombre } });
const og = (prop, valor) => fijar(`meta[property="${prop}"]`, 'content', valor, { tag: 'meta', attrs: { property: prop } });

// Título, descripción, Open Graph, canonical y robots de la página actual.
// Acepta un texto (solo título) o { titulo, descripcion, imagen, noindex, sinSufijo }.
export function usePagina(config) {
  const { pathname } = useLocation();
  const m = typeof config === 'string' ? { titulo: config } : config ?? {};
  const { titulo, descripcion, imagen, noindex, sinSufijo } = m;

  useEffect(() => {
    const completo = titulo ? tituloCompleto({ titulo, sinSufijo }) : NOMBRE_SITIO;
    const origen = window.location.origin;
    const url = origen + pathname;
    const img = origen + (imagen || IMAGEN_OG_DEFECTO);

    document.title = completo;
    if (descripcion) meta('description', descripcion);
    meta('robots', noindex ? 'noindex, follow' : 'index, follow');
    fijar('link[rel="canonical"]', 'href', url, { tag: 'link', attrs: { rel: 'canonical' } });
    og('og:title', completo);
    if (descripcion) og('og:description', descripcion);
    og('og:url', url);
    og('og:image', img);
    meta('twitter:title', completo);
    if (descripcion) meta('twitter:description', descripcion);
    meta('twitter:image', img);
  }, [titulo, descripcion, imagen, noindex, sinSufijo, pathname]);
}
