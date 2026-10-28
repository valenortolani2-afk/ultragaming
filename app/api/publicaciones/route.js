import {
  blobConfigurado, borrarPublicacion, claveValida, esDeBlob, guardarPublicacion, listarCostos, listarPublicaciones, ordenarFotos
} from '../../../lib/publicaciones';
import { buscarCategoria } from '../../../lib/categorias';

const error = (mensaje, status) => Response.json({ error: mensaje }, { status });

// Lista los productos subidos de una categoría (para el panel /admin).
// El precio de costo se agrega solo si llega la contraseña correcta en el encabezado x-clave.
export async function GET(request) {
  const categoria = new URL(request.url).searchParams.get('categoria');
  if (!buscarCategoria(categoria)) return error('Categoría inválida', 400);
  const publicaciones = await listarPublicaciones(categoria);
  if (!claveValida(request.headers.get('x-clave'))) return Response.json(publicaciones);
  const costos = await listarCostos(categoria);
  return Response.json(publicaciones.map(p => ({ ...p, costo: costos[p.id] ?? null })));
}

// Crea un producto con las fotos que el panel ya subió a Blob
export async function POST(request) {
  if (!blobConfigurado()) return error('Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)', 500);
  const { clave, categoria, nombre, precio, costo, descripcion, garantia, fotos } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!buscarCategoria(categoria)) return error('Elegí una categoría', 400);
  if (!nombre?.trim()) return error('Escribí un título', 400);
  if (!(Number(precio) > 0)) return error('El precio de venta tiene que ser un número mayor a cero', 400);
  if (costo !== undefined && costo !== '' && !(Number(costo) >= 0)) return error('El precio de costo tiene que ser un número', 400);
  if (!Array.isArray(fotos) || !fotos.length || fotos.length > 8 || !fotos.every(esDeBlob)) {
    return error('Subí entre 1 y 8 fotos', 400);
  }
  const publicacion = await guardarPublicacion({
    categoria,
    nombre: nombre.trim().slice(0, 120),
    precio,
    costo,
    descripcion: (descripcion || '').trim().slice(0, 1500),
    garantia: (garantia || '').trim().slice(0, 40),
    fotos
  });
  return Response.json(publicacion);
}

// Cambia el orden de las fotos de un producto
export async function PATCH(request) {
  if (!blobConfigurado()) return error('Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)', 500);
  const { clave, url, fotos } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!esDeBlob(url) || !new URL(url).pathname.startsWith('/publicaciones/')) return error('Producto inválido', 400);
  if (!Array.isArray(fotos) || !fotos.length || !fotos.every(esDeBlob)) return error('Fotos inválidas', 400);
  try {
    return Response.json(await ordenarFotos(url, fotos));
  } catch (err) {
    return error(err.message, 400);
  }
}

// Borra un producto y sus fotos
export async function DELETE(request) {
  if (!blobConfigurado()) return error('Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)', 500);
  const { clave, url } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!esDeBlob(url) || !new URL(url).pathname.startsWith('/publicaciones/')) return error('Producto inválido', 400);
  await borrarPublicacion(url);
  return Response.json({ ok: true });
}
