import { randomUUID } from 'crypto';
import { blobConfigurado, buscarPublicacion } from '../../../lib/publicaciones';
import { crearPreferencia, mpConfigurado } from '../../../lib/mercadopago';

const error = (mensaje, status) => Response.json({ error: mensaje }, { status });

// Recibe el carrito, vuelve a leer cada producto con su precio real y crea el pago en Mercado Pago
export async function POST(request) {
  if (!mpConfigurado()) return error('Los pagos con Mercado Pago todavía no están habilitados. Escribinos por WhatsApp para comprar.', 503);
  if (!blobConfigurado()) return error('Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)', 500);

  const { items, comprador: datos = {} } = await request.json().catch(() => ({}));
  if (!Array.isArray(items) || !items.length || items.length > 20) return error('El carrito está vacío', 400);

  const texto = (valor, largo) => String(valor ?? '').trim().slice(0, largo);
  const comprador = {
    nombre: texto(datos.nombre, 60),
    apellido: texto(datos.apellido, 60),
    dni: texto(datos.dni, 12).replace(/\D/g, ''),
    telefono: texto(datos.telefono, 20),
    codigo_postal: texto(datos.codigoPostal, 8).toUpperCase(),
    localidad: texto(datos.localidad, 80),
    direccion: texto(datos.direccion, 120)
  };
  if (!comprador.nombre || !comprador.apellido) return error('Completá tu nombre y apellido', 400);
  if (!/^\d{7,8}$/.test(comprador.dni)) return error('El DNI tiene que tener 7 u 8 números', 400);
  if (comprador.telefono.replace(/\D/g, '').length < 8) return error('Revisá el teléfono: tiene que tener al menos 8 números', 400);
  if (!/^[A-Z0-9]{4,8}$/.test(comprador.codigo_postal)) return error('Revisá el código postal', 400);
  if (!comprador.localidad || !comprador.direccion) return error('Completá la localidad y la dirección', 400);

  const productos = await Promise.all(items.map(async i => {
    const p = await buscarPublicacion(i.slug, i.id);
    const cantidad = Math.max(1, Math.min(Math.floor(Number(i.cantidad)) || 1, 10));
    return p && { p, cantidad };
  }));
  const vigentes = productos.filter(Boolean);
  const actualizados = vigentes.map(({ p, cantidad }) => ({ id: p.id, slug: p.slug, nombre: p.nombre, precio: p.precio, foto: p.fotos[0], cantidad }));

  if (vigentes.length < items.length) {
    return Response.json({ error: 'Algún producto ya no está disponible y lo sacamos del carrito. Revisalo y probá de nuevo.', items: actualizados }, { status: 409 });
  }

  const base = (process.env.BASE_URL || new URL(request.url).origin).replace(/\/$/, '');
  try {
    const preferencia = await crearPreferencia({
      base,
      referencia: randomUUID(),
      comprador,
      items: vigentes.map(({ p, cantidad }) => ({
        // El id lleva categoría e id del producto para registrar la venta cuando llegue el pago
        id: `${p.slug}/${p.id}`,
        title: p.nombre.slice(0, 120),
        category_id: 'computing',
        quantity: cantidad,
        unit_price: p.precio,
        currency_id: 'ARS',
        picture_url: p.fotos[0]
      }))
    });
    return Response.json({ url: preferencia.init_point, items: actualizados });
  } catch (err) {
    console.error('No se pudo crear el pago en Mercado Pago:', err);
    return error('No se pudo iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos.', 502);
  }
}
