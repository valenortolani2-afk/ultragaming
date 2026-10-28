import Link from 'next/link';
import { CheckCircleIcon, ClockIcon, WarningCircleIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { consultar } from '../../lib/contacto';
import VaciarCarrito from './VaciarCarrito';

export const metadata = { title: 'Tu compra · Ultra Gaming', robots: { index: false, follow: false } };

const estados = {
  aprobado: {
    Icono: CheckCircleIcon, clase: 'positivo', titulo: '¡Gracias por tu compra!',
    texto: 'Recibimos tu pago. Te escribimos por WhatsApp para coordinar el envío o el retiro por el local.'
  },
  pendiente: {
    Icono: ClockIcon, clase: '', titulo: 'Tu pago está pendiente',
    texto: 'Mercado Pago todavía está procesando el pago. Cuando se acredite te avisamos para coordinar la entrega.'
  },
  rechazado: {
    Icono: WarningCircleIcon, clase: 'negativo', titulo: 'No se pudo completar el pago',
    texto: 'El pago no se acreditó y tus productos siguen en el carrito. Podés probar con otro medio o escribirnos.'
  }
};

// Mercado Pago trae al cliente acá al terminar el pago
export default async function Compra({ searchParams }) {
  const { estado, payment_id } = await searchParams;
  const e = estados[estado] || estados.rechazado;
  const mensaje = payment_id ? `Hola, hice una compra en la página (pago N° ${payment_id}).` : 'Hola, hice una compra en la página.';

  return (
    <main id="contenido" className="compra contenedor">
      {estado === 'aprobado' && <VaciarCarrito />}
      <e.Icono size={48} weight="fill" className={e.clase} />
      <h1 className="titulo">{e.titulo}</h1>
      <p className="bajada">{e.texto}</p>
      {payment_id && <p className="nota">Número de pago: {payment_id}</p>}
      <div className="compra-acciones">
        <a href={consultar(mensaje)} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
          <WhatsappLogoIcon size={16} weight="fill" /> Escribinos por WhatsApp
        </a>
        <Link href="/#ofertas" className="btn btn-gris">Volver a la tienda</Link>
      </div>
    </main>
  );
}
