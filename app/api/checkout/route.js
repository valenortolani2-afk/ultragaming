import { leerProductos } from '../../../lib/productos';

// Crea el cobro en Mercado Pago. El Access Token se lee del .env y nunca llega al navegador.
export async function POST(req) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return Response.json({ error: 'Falta configurar MP_ACCESS_TOKEN en el archivo .env' }, { status: 500 });

  let pedido;
  try { pedido = await req.json(); } catch { return Response.json({ error: 'Pedido inválido' }, { status: 400 }); }

  // Los precios salen de productos.json, no del navegador, para que nadie los pueda cambiar
  const catalogo = leerProductos();
  const items = [];
  for (const { id, cantidad } of pedido.items || []) {
    const p = catalogo.find(x => x.id === id);
    const cant = Math.floor(Number(cantidad));
    if (!p || !(cant > 0 && cant <= 99)) return Response.json({ error: 'Hay un producto inválido en el carrito' }, { status: 400 });
    items.push({ id: p.id, title: p.nombre, quantity: cant, unit_price: p.precio, currency_id: 'ARS' });
  }
  if (!items.length) return Response.json({ error: 'El carrito está vacío' }, { status: 400 });

  const base = (process.env.BASE_URL || new URL(req.url).origin).replace(/\/$/, '');
  const preferencia = {
    items,
    back_urls: {
      success: `${base}/gracias`,
      failure: `${base}/gracias`,
      pending: `${base}/gracias`
    },
    statement_descriptor: 'ULTRA GAMING'
  };
  // Mercado Pago solo vuelve solo a la tienda si la dirección es https (o sea, ya publicada)
  if (base.startsWith('https://')) preferencia.auto_return = 'approved';

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(preferencia)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('Error de Mercado Pago:', data);
      return Response.json({ error: 'Mercado Pago rechazó el pedido: ' + (data.message || r.status) }, { status: 502 });
    }
    return Response.json({ url: data.init_point });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'No se pudo conectar con Mercado Pago' }, { status: 502 });
  }
}
