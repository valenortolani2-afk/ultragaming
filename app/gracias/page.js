import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@phosphor-icons/react/dist/ssr';
import LimpiarCarrito from './LimpiarCarrito';

export const metadata = { title: 'Ultra Gaming · Tu compra', robots: { index: false } };

const textos = {
  approved: [CheckCircleIcon, 'Gracias por tu compra', 'Tu pago fue aprobado. Te escribimos para coordinar el envío.'],
  pending: [ClockIcon, 'Tu pago está pendiente', 'Cuando Mercado Pago lo acredite, te avisamos por correo.'],
  rejected: [XCircleIcon, 'El pago no se completó', 'No se cobró nada. Podés volver a intentarlo con otro medio de pago.']
};

// Mercado Pago vuelve acá con el estado del pago en la dirección
export default async function Gracias({ searchParams }) {
  const q = await searchParams;
  const estado = q.collection_status || q.status;
  const [Icono, titulo, detalle] = textos[estado] || textos.rejected;
  return (
    <main id="contenido" className="simple">
      <div>
        <Icono size={64} weight="light" className="icono-grande" />
        <h1>{titulo}</h1>
        <p className="bajada">{detalle}</p>
        <a href="/" className="btn btn-principal">Volver a la tienda</a>
      </div>
      {estado === 'approved' && <LimpiarCarrito />}
    </main>
  );
}
