import fs from 'fs';
import path from 'path';

// Lee el catálogo que genera importar.js (con el recargo ya aplicado)
export function leerProductos() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'productos.json'), 'utf8'));
}
