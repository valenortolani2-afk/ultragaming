'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

const intervalo = 6000;

// Portada en carrusel: la primera diapositiva es la foto del local con su texto (children)
// y después van los banners que se suben desde /admin. Pasa sola cada 6 segundos.
export default function Carrusel({ banners, children }) {
  const total = banners.length + 1;
  const [activa, setActiva] = useState(0);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    // Sin movimiento automático si el dispositivo pide reducirlo
    if (total < 2 || pausa || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setActiva(a => (a + 1) % total), intervalo);
    return () => clearTimeout(t);
  }, [activa, pausa, total]);

  if (total < 2) return <section className="hero">{children}</section>;

  const ir = i => setActiva((i + total) % total);

  return (
    <section className="hero carrusel" aria-roledescription="carrusel" aria-label="Portada"
      onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)} onBlur={() => setPausa(false)}>
      <div className={`diapo diapo-inicio${activa === 0 ? ' activa' : ''}`} aria-roledescription="diapositiva" aria-label={`1 de ${total}`} inert={activa !== 0}>
        {children}
      </div>

      {banners.map((b, i) => (
        <div key={b.url} className={`diapo diapo-banner${activa === i + 1 ? ' activa' : ''}`}
          aria-roledescription="diapositiva" aria-label={`${i + 2} de ${total}`} inert={activa !== i + 1}>
          {/* El banner se ve completo; la misma imagen desenfocada llena los costados */}
          <Image src={b.url} alt="" aria-hidden fill sizes="64px" className="banner-fondo" />
          <div className="banner-marco">
            <Image src={b.url} alt={`Banner ${i + 1} de Ultra Gaming`} fill sizes="100vw" className="banner-foto" priority={i === 0} />
          </div>
        </div>
      ))}

      <button className="carrusel-flecha anterior" onClick={() => ir(activa - 1)} aria-label="Anterior"><CaretLeftIcon size={20} weight="bold" /></button>
      <button className="carrusel-flecha siguiente" onClick={() => ir(activa + 1)} aria-label="Siguiente"><CaretRightIcon size={20} weight="bold" /></button>
      <div className="carrusel-puntos">
        {Array.from({ length: total }, (_, i) => (
          <button key={i} className={i === activa ? 'activo' : ''} onClick={() => ir(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === activa || undefined} />
        ))}
      </div>
    </section>
  );
}
