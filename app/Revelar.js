'use client';

import { useEffect, useRef, useState } from 'react';

// Hace aparecer una sección (subiendo un poco) la primera vez que entra en pantalla
export function Revelar({ as: Tag = 'section', className = '', children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <Tag ref={ref} className={`revelar ${visible ? 'visible' : ''} ${className}`} {...props}>{children}</Tag>;
}

// Frase grande: cada palabra se ilumina de a una al cruzar la mitad de la pantalla
export function FraseReveladora({ lineas }) {
  const ref = useRef(null);
  useEffect(() => {
    const palabras = ref.current.querySelectorAll('.palabra');
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40% 0px' });
    palabras.forEach(p => obs.observe(p));
    return () => obs.disconnect();
  }, []);
  return (
    <p ref={ref}>
      {lineas.map((linea, i) => (
        <span key={i} style={{ display: 'block' }}>
          {linea.split(' ').map((w, j) => <span key={j} className="palabra">{w} </span>)}
        </span>
      ))}
    </p>
  );
}
