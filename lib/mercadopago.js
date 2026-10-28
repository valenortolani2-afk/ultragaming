// Conexión con la API de Mercado Pago (Checkout Pro). El Access Token se carga en Vercel como MP_ACCESS_TOKEN.
const api = 'https://api.mercadopago.com';

export const mpConfigurado = () => Boolean(process.env.MP_ACCESS_TOKEN);

async function pedir(ruta, opciones = {}) {
  const r = await fetch(api + ruta, {
    ...opciones,
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json', ...opciones.headers },
    cache: 'no-store'
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `Mercado Pago respondió ${r.status}`);
  return data;
}

// Crea la preferencia de pago y devuelve el link al que se lleva al cliente
export function crearPreferencia({ items, base, referencia }) {
  // Mercado Pago solo acepta direcciones públicas con https para volver solo y para avisar los pagos
  const publica = base.startsWith('https://');
  return pedir('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': referencia },
    body: JSON.stringify({
      items,
      external_reference: referencia,
      statement_descriptor: 'ULTRAGAMING',
      back_urls: {
        success: `${base}/compra?estado=aprobado`,
        pending: `${base}/compra?estado=pendiente`,
        failure: `${base}/compra?estado=rechazado`
      },
      ...(publica && { auto_return: 'approved', notification_url: `${base}/api/mercadopago` })
    })
  });
}

export const buscarPago = id => pedir(`/v1/payments/${encodeURIComponent(id)}`);
