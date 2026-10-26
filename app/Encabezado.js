import Link from 'next/link';
import { ArrowLeftIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { whatsapp } from '../lib/contacto';

// Barra simple para las páginas internas (rubros, admin)
export default function Encabezado() {
  return (
    <nav className="nav" aria-label="Principal">
      <Link href="/" className="logo" aria-label="Ultra Gaming, inicio">ULTRA<span>GAMING</span></Link>
      <div className="nav-links nav-links-fijos">
        <Link href="/#rubros"><ArrowLeftIcon size={14} /> Todos los rubros</Link>
      </div>
      <div className="nav-acciones">
        <a href={whatsapp.link} className="btn-icono" target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsapp.texto}`}>
          <WhatsappLogoIcon size={16} />
        </a>
      </div>
    </nav>
  );
}
