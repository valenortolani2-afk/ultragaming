import { escribirA, pesos } from './contacto';

// Aviso por mail de cada venta, enviado con Resend (resend.com).
// En Vercel: RESEND_API_KEY con la clave de Resend y AVISO_VENTAS_EMAIL con el mail que recibe los avisos
// (si son varios, separados por coma). RESEND_FROM es opcional, para mandar desde un dominio propio verificado.
export const avisosConfigurados = () => Boolean(process.env.RESEND_API_KEY && process.env.AVISO_VENTAS_EMAIL);

// Los datos los escribe el comprador: se escapan para que no puedan meter HTML en el mail
const esc = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Arma el asunto, el HTML y el texto del mail de una venta (un mail por pago, con todos sus productos)
export function armarAvisoVenta({ ventas, cliente, email, pago, base }) {
  const total = ventas.reduce((s, v) => s + v.precio, 0);
  const conCosto = ventas.filter(v => v.costo !== null);
  const ganancia = conCosto.reduce((s, v) => s + v.precio - v.costo, 0);
  const faltanCostos = conCosto.length < ventas.length;
  const nombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : email || 'Un cliente';
  const whatsapp = cliente && escribirA(cliente.telefono, `Hola ${cliente.nombre}, te escribimos de Ultra Gaming por tu compra.`);

  const asunto = `Nueva venta: ${pesos(total)} · ${ventas.length === 1 ? ventas[0].nombre : `${ventas.length} productos`}`;

  const filas = ventas.map(v => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${esc(v.nombre)}<br><span style="color:#6b7280;font-size:12px">${esc(v.categoria)}</span></td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${v.costo === null ? 'Sin cargar' : pesos(v.costo)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${pesos(v.precio)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${v.costo === null ? '—' : pesos(v.precio - v.costo)}</td>
    </tr>`).join('');

  const datosCliente = cliente ? `
    <p style="margin:0 0 4px"><strong>${esc(nombre)}</strong> · DNI ${esc(cliente.dni)}</p>
    <p style="margin:0 0 4px">Teléfono: ${whatsapp ? `<a href="${whatsapp}" style="color:#16a34a;font-weight:600">${esc(cliente.telefono)} (abrir WhatsApp)</a>` : esc(cliente.telefono)}</p>
    <p style="margin:0 0 4px">${esc(cliente.direccion)}, ${esc(cliente.localidad)} (CP ${esc(cliente.codigoPostal)})</p>
    ${email ? `<p style="margin:0">Mail: ${esc(email)}</p>` : ''}`
    : `<p style="margin:0">${esc(email || 'Sin datos del comprador')}</p>`;

  const html = `
  <div style="font-family:Arial,sans-serif;color:#111827;max-width:600px">
    <h2 style="margin:0 0 4px">¡Nueva venta en la página!</h2>
    <p style="margin:0 0 16px;color:#6b7280">Pago aprobado en Mercado Pago N° ${esc(pago)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="text-align:left;color:#6b7280">
        <th style="padding:8px">Producto</th><th style="padding:8px;text-align:right">Costo</th>
        <th style="padding:8px;text-align:right">Venta</th><th style="padding:8px;text-align:right">Ganancia</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <p style="font-size:16px;margin:16px 0 4px"><strong>Total cobrado: ${pesos(total)}</strong></p>
    <p style="font-size:16px;margin:0 0 4px;color:#16a34a"><strong>Ganancia: ${pesos(ganancia)}</strong></p>
    ${faltanCostos ? '<p style="margin:0;color:#6b7280;font-size:12px">Algún producto no tiene costo cargado y no suma a la ganancia.</p>' : ''}
    <h3 style="margin:24px 0 8px">Comprador</h3>
    ${datosCliente}
    <p style="margin:24px 0 0"><a href="${base}/admin" style="color:#1677c2">Ver todas las ventas en el panel</a></p>
  </div>`;

  const texto = [
    `Nueva venta en la página. Pago de Mercado Pago N° ${pago}.`,
    '',
    ...ventas.map(v => `- ${v.nombre}: venta ${pesos(v.precio)}, costo ${v.costo === null ? 'sin cargar' : pesos(v.costo)}`),
    '',
    `Total cobrado: ${pesos(total)}`,
    `Ganancia: ${pesos(ganancia)}`,
    '',
    `Comprador: ${nombre}`,
    ...(cliente ? [`DNI ${cliente.dni} · Tel. ${cliente.telefono}`, `${cliente.direccion}, ${cliente.localidad} (CP ${cliente.codigoPostal})`] : []),
    ...(email ? [`Mail: ${email}`] : []),
    ...(whatsapp ? [`WhatsApp: ${whatsapp}`] : []),
    '',
    `Panel: ${base}/admin`
  ].join('\n');

  return { asunto, html, texto };
}

export async function avisarVenta(datos) {
  if (!avisosConfigurados()) return;
  const { asunto, html, texto } = armarAvisoVenta(datos);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Ultra Gaming <onboarding@resend.dev>',
      to: process.env.AVISO_VENTAS_EMAIL.split(',').map(m => m.trim()).filter(Boolean),
      subject: asunto,
      html,
      text: texto
    })
  });
  if (!r.ok) throw new Error(`Resend respondió ${r.status}: ${await r.text()}`);
}
