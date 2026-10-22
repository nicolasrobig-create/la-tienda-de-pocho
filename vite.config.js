import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // El manifiesto lo lee scripts/postbuild.js para precargar el código de cada página.
  build: { manifest: true },
  // Los JSON (catálogo y precios) se incluyen como JSON.parse(): V8 lo procesa más rápido que un objeto literal grande.
  json: { stringify: true },
});
