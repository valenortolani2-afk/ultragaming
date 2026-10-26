import { del, list, put } from '@vercel/blob';
import { timingSafeEqual } from 'crypto';
import { buscarRubro } from './rubros';

// Cada publicación se guarda en Vercel Blob como publicaciones/<rubro>/<id>.json,
// y sus fotos como archivos aparte (las sube el panel de /admin directo a Blob).

export const blobConfigurado = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Compara la contraseña del panel sin filtrar información por el tiempo de respuesta
export function claveValida(clave) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof clave !== 'string') return false;
  const a = Buffer.from(clave), b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Las fotos tienen que estar en tu propio almacenamiento de Vercel Blob
export const esFotoDeBlob = url => {
  try { return new URL(url).hostname.endsWith('.public.blob.vercel-storage.com'); } catch { return false; }
};

export async function listarPublicaciones(slug) {
  if (!blobConfigurado() || !buscarRubro(slug)) return [];
  const { blobs } = await list({ prefix: `publicaciones/${slug}/` });
  const datos = await Promise.all(blobs
    .filter(b => b.pathname.endsWith('.json'))
    .map(async b => {
      try {
        const r = await fetch(b.url, { cache: 'no-store' });
        return r.ok ? { ...(await r.json()), url: b.url } : null;
      } catch { return null; }
    }));
  return datos.filter(Boolean).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function guardarPublicacion({ rubro, titulo, precio, descripcion, fotos }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const publicacion = {
    id, rubro, titulo, descripcion, fotos,
    precio: precio ? Math.round(Number(precio)) : null,
    fecha: new Date().toISOString()
  };
  await put(`publicaciones/${rubro}/${id}.json`, JSON.stringify(publicacion), {
    access: 'public', contentType: 'application/json', addRandomSuffix: false
  });
  return publicacion;
}

// Borra la publicación y sus fotos
export async function borrarPublicacion(urlJson) {
  const r = await fetch(urlJson, { cache: 'no-store' });
  const { fotos = [] } = r.ok ? await r.json() : {};
  await del([urlJson, ...fotos.filter(esFotoDeBlob)]);
}
