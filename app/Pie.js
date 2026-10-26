import { InstagramLogoIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { instagram, listar, marcas, memorias, whatsapp } from '../lib/contacto';

export default function Pie() {
  return (
    <footer className="pie-sitio">
      <div className="contenedor">
        <div className="pie-marca">
          <p className="logo">ULTRA<span>GAMING</span></p>
          <p>Tienda informática · Servicio técnico</p>
          <p>Vendemos {listar(marcas)}</p>
          <p>Memorias {listar(memorias)}</p>
        </div>
        <nav aria-label="Contacto" className="pie-contacto">
          <a href={whatsapp.link} target="_blank" rel="noopener noreferrer"><WhatsappLogoIcon size={20} /> {whatsapp.texto}</a>
          <a href={instagram.link} target="_blank" rel="noopener noreferrer"><InstagramLogoIcon size={20} /> {instagram.texto}</a>
        </nav>
        <nav aria-label="Legales" className="pie-legales">
          <a href="/legales#privacidad">Privacidad</a>
          <a href="/legales#terminos">Términos y condiciones</a>
          <a href="/legales#arrepentimiento">Botón de arrepentimiento</a>
        </nav>
        <p className="pie-copy">© 2026 Ultra Gaming · Envíos a todo el país</p>
      </div>
    </footer>
  );
}
