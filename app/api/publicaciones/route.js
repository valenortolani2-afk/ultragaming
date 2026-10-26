import {
  blobConfigurado, borrarPublicacion, claveValida, esFotoDeBlob, guardarPublicacion, listarPublicaciones
} from '../../../lib/publicaciones';
import { buscarRubro } from '../../../lib/rubros';

const error = (mensaje, status) => Response.json({ error: mensaje }, { status });

// Lista las publicaciones de un rubro (para el panel de /admin)
export async function GET(request) {
  const rubro = new URL(request.url).searchParams.get('rubro');
  if (!buscarRubro(rubro)) return error('Rubro inválido', 400);
  return Response.json(await listarPublicaciones(rubro));
}

// Crea una publicación con las fotos que el panel ya subió a Blob
export async function POST(request) {
  if (!blobConfigurado()) return error('Falta configurar BLOB_READ_WRITE_TOKEN', 500);
  const { clave, rubro, titulo, precio, descripcion, fotos } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!buscarRubro(rubro)) return error('Elegí un rubro', 400);
  if (!titulo?.trim()) return error('Escribí un título', 400);
  if (precio && !(Number(precio) > 0)) return error('El precio tiene que ser un número mayor a cero', 400);
  if (!Array.isArray(fotos) || !fotos.length || fotos.length > 8 || !fotos.every(esFotoDeBlob)) {
    return error('Subí entre 1 y 8 fotos', 400);
  }
  const publicacion = await guardarPublicacion({
    rubro, titulo: titulo.trim().slice(0, 120), precio, descripcion: (descripcion || '').trim().slice(0, 1000), fotos
  });
  return Response.json(publicacion);
}

// Borra una publicación y sus fotos
export async function DELETE(request) {
  if (!blobConfigurado()) return error('Falta configurar BLOB_READ_WRITE_TOKEN', 500);
  const { clave, url } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!esFotoDeBlob(url) || !new URL(url).pathname.startsWith('/publicaciones/')) return error('Publicación inválida', 400);
  await borrarPublicacion(url);
  return Response.json({ ok: true });
}
