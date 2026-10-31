import { categorias } from './categorias';
import { listarPublicaciones } from './publicaciones';

// Sin mayúsculas ni tildes, para que "rtx 5060" encuentre "RTX 5060" y "linea" encuentre "Línea"
export const normalizar = texto => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Leer todas las publicaciones de Blob tarda, así que se guardan unos segundos entre búsquedas
let guardadas = { cuando: 0, lista: null };
async function todasLasPublicaciones() {
  if (!guardadas.lista || Date.now() - guardadas.cuando > 30_000) {
    guardadas = { cuando: Date.now(), lista: await listarPublicaciones() };
  }
  return guardadas.lista;
}

// Devuelve las categorías y los productos publicados que tienen todas las palabras buscadas.
// Primero van los productos que las tienen en el título o la categoría; después los que solo las tienen en la descripción.
export async function buscar(consulta) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean).slice(0, 8);
  if (!palabras.length) return { categorias: [], productos: [] };
  const tieneTodas = texto => palabras.every(p => texto.includes(p));

  const enCategorias = categorias.filter(c => tieneTodas(normalizar(`${c.nombre} ${c.titulo}`)));
  const titulo = [], descripcion = [];
  for (const p of await todasLasPublicaciones()) {
    const base = normalizar(`${p.nombre} ${p.categoria}`);
    if (tieneTodas(base)) titulo.push(p);
    else if (tieneTodas(`${base} ${normalizar(p.descripcion)}`)) descripcion.push(p);
  }
  return { categorias: enCategorias, productos: [...titulo, ...descripcion] };
}
