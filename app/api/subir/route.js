import { claveValida } from '../../../lib/publicaciones';
import { cloudinaryConfigurado, permisoDeSubida } from '../../../lib/cloudinary';
import { buscarCategoria } from '../../../lib/categorias';

// Entrega al panel /admin un permiso firmado para subir una foto directo a Cloudinary
export async function POST(request) {
  if (!cloudinaryConfigurado()) return Response.json({ error: 'Falta configurar Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET)' }, { status: 500 });
  const { clave, categoria } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  // Fotos de productos van en fotos/<categoría>/ y los banners de la portada en banners/
  if (categoria === 'banners') return Response.json(permisoDeSubida('banners', 'banner'));
  if (!buscarCategoria(categoria)) return Response.json({ error: 'Categoría inválida' }, { status: 400 });
  return Response.json(permisoDeSubida(`fotos/${categoria}`));
}
