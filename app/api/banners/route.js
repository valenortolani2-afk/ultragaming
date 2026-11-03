import { avisarCambioDeBanners, borrarBanner, claveValida, esBanner, listarBanners } from '../../../lib/publicaciones';

const error = (mensaje, status) => Response.json({ error: mensaje }, { status });

// Lista los banners del carrusel (las imágenes se suben desde el panel con /api/subir)
export async function GET() {
  return Response.json(await listarBanners());
}

// El panel avisa que subió banners nuevos a Cloudinary, para que la portada los muestre
export async function POST(request) {
  const { clave } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  avisarCambioDeBanners();
  return Response.json({ ok: true });
}

// Borra un banner
export async function DELETE(request) {
  const { clave, url } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!esBanner(url)) return error('Banner inválido', 400);
  await borrarBanner(url);
  return Response.json({ ok: true });
}
