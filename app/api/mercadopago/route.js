import { buscarPago, mpConfigurado } from '../../../lib/mercadopago';
import { blobConfigurado, guardarVenta, hayVentasCon, listarCostos } from '../../../lib/publicaciones';
import { buscarCategoria } from '../../../lib/categorias';

// Mercado Pago avisa acá cada vez que cambia un pago. No se confía en el aviso:
// se vuelve a consultar el pago a Mercado Pago con el Access Token y solo se registran los aprobados.
export async function POST(request) {
  if (!mpConfigurado() || !blobConfigurado()) return new Response(null, { status: 200 });

  const url = new URL(request.url);
  const cuerpo = await request.json().catch(() => ({}));
  const tipo = cuerpo.type || url.searchParams.get('type') || url.searchParams.get('topic');
  const id = cuerpo.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');
  if (tipo !== 'payment' || !id) return new Response(null, { status: 200 });

  try {
    const pago = await buscarPago(id);
    if (pago.status !== 'approved') return new Response(null, { status: 200 });

    // Mercado Pago puede avisar el mismo pago varias veces: se registra una sola vez
    const prefijo = `mp-${pago.id}-`;
    if (await hayVentasCon(prefijo)) return new Response(null, { status: 200 });

    const items = pago.additional_info?.items || [];
    const costosPorCategoria = {};
    for (const item of items) {
      const [slug, producto] = String(item.id || '').split('/');
      const cantidad = Number(item.quantity) || 1;
      const unitario = Number(item.unit_price) || 0;
      costosPorCategoria[slug] ??= buscarCategoria(slug) ? await listarCostos(slug) : {};
      const costo = costosPorCategoria[slug][producto];
      await guardarVenta({
        producto, slug,
        nombre: cantidad > 1 ? `${item.title} (x${cantidad})` : item.title,
        categoria: buscarCategoria(slug)?.nombre || '',
        costo: costo === undefined || costo === null ? null : costo * cantidad,
        precio: Math.round(unitario * cantidad),
        origen: 'Mercado Pago',
        pago: String(pago.id),
        comprador: pago.payer?.email || ''
      }, prefijo);
    }
    return new Response(null, { status: 200 });
  } catch (err) {
    // Con un error, Mercado Pago vuelve a intentar más tarde
    console.error('No se pudo procesar el aviso de Mercado Pago:', err);
    return new Response(null, { status: 500 });
  }
}
