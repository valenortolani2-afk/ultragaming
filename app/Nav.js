'use client';

import { useEffect, useState } from 'react';
import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCarrito } from './carrito';

const links = [
  { href: '#rubros', texto: 'Qué vendemos' },
  { href: '#servicio-tecnico', texto: 'Servicio técnico' },
  { href: '#catalogo', texto: 'Catálogo' },
  { href: '#preguntas', texto: 'Preguntas' }
];

export default function Nav() {
  const { unidades, setAbierto } = useCarrito();
  const [menu, setMenu] = useState(false);
  const [activo, setActivo] = useState('');

  // Marca en la barra la sección que se está viendo
  useEffect(() => {
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => e.isIntersecting && setActivo(e.target.id ? '#' + e.target.id : ''));
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => { const s = document.querySelector(l.href); if (s) obs.observe(s); });
    const portada = document.querySelector('.hero');
    if (portada) obs.observe(portada);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
  }, [menu]);

  return (
    <>
      <nav className="nav" aria-label="Principal">
        <a href="#contenido" className="logo" aria-label="Ultra Gaming, inicio">ULTRA<span>GAMING</span></a>
        <div className="nav-links">
          {links.map(l => (
            <a key={l.href} href={l.href} className={activo === l.href ? 'activo' : ''} aria-current={activo === l.href ? 'true' : undefined}>
              {l.texto}
            </a>
          ))}
        </div>
        <div className="nav-acciones">
          <button className="btn-icono carrito-btn" aria-label={`Abrir carrito, ${unidades} productos`} onClick={() => setAbierto(true)}>
            <ShoppingCartIcon size={16} />
            {unidades > 0 && <b>{unidades}</b>}
          </button>
          <button className="btn-icono menu-btn" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(m => !m)}>
            <span className="menu-icono"><i /><i /><i /></span>
          </button>
        </div>
      </nav>

      <div className={'menu-movil' + (menu ? ' abierto' : '')} aria-hidden={!menu} inert={!menu}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={() => setMenu(false)} style={{ transitionDelay: menu ? `${Math.min(i * 60, 400)}ms` : '0ms' }}>
            {l.texto}
          </a>
        ))}
      </div>
    </>
  );
}
