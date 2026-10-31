'use client';

import { useEffect, useState } from 'react';
import { WhatsappLogoIcon } from '@phosphor-icons/react';
import { whatsapp } from '../lib/contacto';
import { BotonCarrito } from './Carrito';
import Buscador from './Buscador';

const links = [
  { href: '#ofertas', texto: 'Ofertas' },
  { href: '#garantia', texto: 'Garantía' },
  { href: '#preguntas', texto: 'Preguntas' },
  { href: '#local', texto: 'El local' }
];

export default function Nav() {
  const [menu, setMenu] = useState(false);
  const [activo, setActivo] = useState('');
  const [arriba, setArriba] = useState(false);

  useEffect(() => {
    // Marca en la barra la sección que se está viendo
    const secciones = new IntersectionObserver(entradas => {
      entradas.forEach(e => e.isIntersecting && setActivo(e.target.id ? '#' + e.target.id : ''));
    }, { rootMargin: '-45% 0px -50% 0px' });
    [...links.map(l => document.querySelector(l.href)), document.querySelector('.hero')]
      .forEach(s => s && secciones.observe(s));

    // Cuando la franja azul sale de pantalla, la barra sube al borde
    const franja = new IntersectionObserver(([e]) => setArriba(!e.isIntersecting));
    const f = document.querySelector('.franja');
    if (f) franja.observe(f);

    return () => { secciones.disconnect(); franja.disconnect(); };
  }, []);

  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  return (
    <>
      <nav className={'nav' + (arriba ? ' arriba' : '')} aria-label="Principal">
        <a href="#contenido" className="logo" aria-label="Ultra Gaming, inicio">ULTRA<span>GAMING</span></a>
        <div className="nav-links">
          {links.map(l => (
            <a key={l.href} href={l.href} className={activo === l.href ? 'activo' : ''} aria-current={activo === l.href ? 'true' : undefined}>{l.texto}</a>
          ))}
        </div>
        <div className="nav-acciones">
          <Buscador />
          <a href={whatsapp.link} className="btn-icono" target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsapp.texto}`}>
            <WhatsappLogoIcon size={16} />
          </a>
          <BotonCarrito />
          <button className="btn-icono menu-btn" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(m => !m)}>
            <span className="menu-icono"><i /><i /><i /></span>
          </button>
        </div>
      </nav>

      <div className={'menu-movil' + (menu ? ' abierto' : '')} aria-hidden={!menu} inert={!menu}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={() => setMenu(false)} style={{ transitionDelay: menu ? `${Math.min(i * 60, 400)}ms` : '0ms' }}>{l.texto}</a>
        ))}
      </div>
    </>
  );
}
