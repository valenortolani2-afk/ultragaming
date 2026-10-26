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

// El precio de costo se guarda aparte, en costos/<categoria>/<id>-<sufijo>.json, para que nunca llegue a la vidriera.
// Esa dirección no aparece en ninguna página y solo se puede listar con el token de Blob.
async function guardarCosto(categoria, id, costo) {
  await put(`costos/${categoria}/${id}.json`, JSON.stringify({ id, costo: Math.round(Number(costo)) }), {
    access: 'public', contentType: 'application/json', addRandomSuffix: true
  });
}

// Devuelve { id: costo } de una categoría. Solo se usa en el panel, con la contraseña correcta.
export async function listarCostos(slug) {
  if (!blobConfigurado()) return {};
  try {
    const { blobs } = await list({ prefix: `costos/${slug}/` });
    const datos = await Promise.all(blobs.map(async b => {
      try {
        const r = await fetch(b.url, { cache: 'no-store' });
        return r.ok ? await r.json() : null;
      } catch { return null; }
    }));
    return Object.fromEntries(datos.filter(Boolean).map(d => [d.id, d.costo]));
  } catch (err) {
    console.error('No se pudieron leer los costos de Blob:', err);
    return {};
  }
}

export async function guardarPublicacion({ categoria, nombre, precio, costo, descripcion, garantia, fotos }) {
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
  if (costo !== undefined && costo !== '') await guardarCosto(categoria, id, costo);
  return publicacion;
}

// Cada venta queda en ventas/<id>-<sufijo>.json con el costo y el precio final de ese momento.
// Como los costos, la dirección es aleatoria y solo el panel la lee con la contraseña.
export async function registrarVenta({ urlJson, precio, quitar }) {
  const r = await fetch(urlJson, { cache: 'no-store' });
  if (!r.ok) throw new Error('No se encontró el producto');
  const p = await r.json();
  const costo = (await listarCostos(p.slug))[p.id] ?? null;
  const venta = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    producto: p.id, nombre: p.nombre, categoria: p.categoria, slug: p.slug,
    costo, precio: Math.round(Number(precio)),
    fecha: new Date().toISOString()
  };
  await put(`ventas/${venta.id}.json`, JSON.stringify(venta), {
    access: 'public', contentType: 'application/json', addRandomSuffix: true
  });
  if (quitar) await borrarPublicacion(urlJson);
  return venta;
}

// Devuelve las ventas, de la más nueva a la más vieja
export async function listarVentas() {
  if (!blobConfigurado()) return [];
  const { blobs } = await list({ prefix: 'ventas/' });
  const datos = await Promise.all(blobs.map(async b => {
    try {
      const r = await fetch(b.url, { cache: 'no-store' });
      return r.ok ? { ...(await r.json()), url: b.url } : null;
    } catch { return null; }
  }));
  return datos.filter(Boolean).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export const esVenta = url => esDeBlob(url) && new URL(url).pathname.startsWith('/ventas/');
export const borrarVenta = url => del(url);

// Borra el producto, sus fotos y su precio de costo
export async function borrarPublicacion(urlJson) {
  const r = await fetch(urlJson, { cache: 'no-store' });
  const { id, slug, fotos = [] } = r.ok ? await r.json() : {};
  const costos = id && slug ? (await list({ prefix: `costos/${slug}/${id}` })).blobs.map(b => b.url) : [];
  await del([urlJson, ...fotos.filter(esDeBlob), ...costos]);
}
