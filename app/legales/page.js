import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';
import Pie from '../Pie';
import { whatsapp } from '../../lib/contacto';

export const metadata = { title: 'Ultra Gaming · Legales' };

// IMPORTANTE: textos de base. Completá los datos marcados con [ ] y hacelos revisar antes de publicar.
export default function Legales() {
  return (
    <>
      <main id="contenido" className="legal">
        <a href="/" className="volver"><ArrowLeftIcon size={16} /> Volver a la tienda</a>
        <h1>Información legal</h1>

        <h2 id="privacidad">Política de privacidad</h2>
        <p>Usamos tus datos (nombre, correo, teléfono y dirección) solo para procesar tu compra, coordinar el envío y emitir la factura.</p>
        <p>Los pagos se procesan en Mercado Pago. Nunca vemos ni guardamos los datos de tu tarjeta.</p>
        <p>Podés pedir que actualicemos o borremos tus datos escribiendo a [tu correo de contacto].</p>

        <h2 id="terminos">Términos y condiciones</h2>
        <ul>
          <li>Los precios están expresados en pesos argentinos e incluyen IVA.</li>
          <li>La compra se confirma cuando Mercado Pago acredita el pago.</li>
          <li>El costo y el plazo del envío se informan antes de despachar el pedido.</li>
          <li>La garantía de cada producto se rige por la de su fabricante y se hace valer con la factura.</li>
          <li>Titular de la tienda: [razón social], CUIT [número], domicilio [dirección].</li>
        </ul>

        <h2 id="arrepentimiento">Botón de arrepentimiento</h2>
        <p>Tenés 10 días corridos desde que recibís el producto para revocar la compra, sin costo y sin dar explicaciones (Ley 24.240 y Resolución 424/2020).</p>
        <p>Para hacerlo, escribinos por WhatsApp al {whatsapp.texto} o a [tu correo de contacto] con tu nombre y el número de operación de Mercado Pago. Te respondemos con un código de seguimiento de tu pedido de arrepentimiento dentro de las 24 horas.</p>
      </main>
      <Pie />
    </>
  );
}
