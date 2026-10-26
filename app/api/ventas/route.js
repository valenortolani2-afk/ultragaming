import {
  blobConfigurado, borrarVenta, claveValida, esDeBlob, esVenta, listarVentas, registrarVenta
} from '../../../lib/publicaciones';

const error = (mensaje, status) => Response.json({ error: mensaje }, { status });

// Lista las ventas (solo para el panel /admin, con la contraseña en el encabezado x-clave)
export async function GET(request) {
  if (!claveValida(request.headers.get('x-clave'))) return error('Contraseña incorrecta', 401);
  return Response.json(await listarVentas());
}

// Registra la venta de un producto y, si se pide, lo saca de la vidriera
export async function POST(request) {
  if (!blobConfigurado()) return error('Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)', 500);
  const { clave, url, precio, quitar } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!esDeBlob(url) || !new URL(url).pathname.startsWith('/publicaciones/')) return error('Producto inválido', 400);
  if (!(Number(precio) > 0)) return error('El precio final tiene que ser un número mayor a cero', 400);
  return Response.json(await registrarVenta({ urlJson: url, precio, quitar: Boolean(quitar) }));
}

// Borra una venta cargada por error
export async function DELETE(request) {
  if (!blobConfigurado()) return error('Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)', 500);
  const { clave, url } = await request.json().catch(() => ({}));
  if (!claveValida(clave)) return error('Contraseña incorrecta', 401);
  if (!esVenta(url)) return error('Venta inválida', 400);
  await borrarVenta(url);
  return Response.json({ ok: true });
}
