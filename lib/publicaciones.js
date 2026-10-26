import { del, list, put } from '@vercel/blob';
import { timingSafeEqual } from 'crypto';
import { buscarCategoria } from './categorias';
import { garantia as garantiaBase } from './contacto';

// Cada producto subido desde /admin se guarda en Vercel Blob como publicaciones/<categoria>/<id>.json.
// Sus fotos son archivos aparte que el panel sube directo a Blob.

export const blobConfigurado = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Compara la contraseña del panel sin filtrar información por el tiempo de respuesta
export function claveValida(clave) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof clave !== 'string') return false;
  const a = Buffer.from(clave), b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Las fotos tienen que estar en tu propio almacenamiento de Vercel Blob
export const esDeBlob = url => {
  try { return new URL(url).hostname.endsWith('.public.blob.vercel-storage.com'); } catch { return false; }
};

// Devuelve los productos subidos, del más nuevo al más viejo, con el formato de la vidriera
export async function listarPublicaciones(slug) {
  if (!blobConfigurado()) return [];
  try {
    const { blobs } = await list({ prefix: slug ? `publicaciones/${slug}/` : 'publicaciones/' });
    const datos = await Promise.all(blobs
      .filter(b => b.pathname.endsWith('.json'))
      .map(async b => {
        try {
          const r = await fetch(b.url, { cache: 'no-store' });
          return r.ok ? { ...(await r.json()), url: b.url } : null;
        } catch { return null; }
      }));
    return datos.filter(Boolean).sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch (err) {
    console.error('No se pudieron leer las publicaciones de Blob:', err);
    return [];
  }
}

export async function guardarPublicacion({ categoria, nombre, precio, descripcion, garantia, fotos }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const publicacion = {
    id, nombre, descripcion, fotos,
    categoria: buscarCategoria(categoria).nombre,
    slug: categoria,
    precio: Math.round(Number(precio)),
    garantia: garantia || garantiaBase,
    detalles: [],
    fecha: new Date().toISOString()
  };
  await put(`publicaciones/${categoria}/${id}.json`, JSON.stringify(publicacion), {
    access: 'public', contentType: 'application/json', addRandomSuffix: false
  });
  return publicacion;
}

// Borra el producto y sus fotos
export async function borrarPublicacion(urlJson) {
  const r = await fetch(urlJson, { cache: 'no-store' });
  const { fotos = [] } = r.ok ? await r.json() : {};
  await del([urlJson, ...fotos.filter(esDeBlob)]);
}
