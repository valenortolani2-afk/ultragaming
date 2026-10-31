import Link from 'next/link';
import { ArrowLeftIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { listarPublicaciones } from '../../lib/publicaciones';
import { datosDe, pasos } from '../../lib/armado';
import { whatsapp } from '../../lib/contacto';
import { BotonCarrito } from '../Carrito';
import Buscador from '../Buscador';
import Armador from './Armador';

export const metadata = {
  title: 'Armá tu PC · Ultra Gaming',
  description: 'Elegí paso a paso las piezas de tu PC entre el stock de Ultra Gaming. Te mostramos solo las que son compatibles entre sí.'
};

// Se arma en cada visita para ofrecer siempre el stock que está publicado
export const dynamic = 'force-dynamic';

export default async function ArmaTuPc() {
  const usadas = new Set(pasos.flatMap(p => p.categorias));
  // Al navegador va solo lo que usa el armador (sin descripciones largas), con los datos de compatibilidad ya calculados
  const productos = (await listarPublicaciones())
    .filter(p => usadas.has(p.slug) && p.fotos?.length)
    .map(p => ({
      id: p.id, slug: p.slug, nombre: p.nombre, precio: p.precio, desde: p.desde || false,
      categoria: p.categoria, fotos: [p.fotos[0]], datos: datosDe(p)
    }));

  return (
    <>
      <nav className="nav arriba" aria-label="Principal">
        <Link href="/" className="logo" aria-label="Ultra Gaming, inicio">ULTRA<span>GAMING</span></Link>
        <div className="nav-links nav-links-fijos">
          <Link href="/" aria-label="Volver al inicio"><ArrowLeftIcon size={14} /> <span>Inicio</span></Link>
        </div>
        <div className="nav-acciones">
          <Buscador />
          <a href={whatsapp.link} className="btn-icono" target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsapp.texto}`}>
            <WhatsappLogoIcon size={16} />
          </a>
          <BotonCarrito />
        </div>
      </nav>

      <main id="contenido" className="armado-pagina">
        <div className="contenedor">
          <p className="etiqueta">Armá tu PC</p>
          <h1 className="titulo">Elegí las piezas paso a paso</h1>
          <p className="bajada">Te mostramos el stock que tenemos y solo te dejamos elegir piezas que van juntas. Al final la sumás al carrito o nos la mandás por WhatsApp.</p>
          <Armador productos={productos} />
        </div>
      </main>

      <a href={whatsapp.link} className="wa-flotante" target="_blank" rel="noopener noreferrer" aria-label={`Escribinos por WhatsApp al ${whatsapp.texto}`}>
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
    </>
  );
}
