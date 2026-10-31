'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const intervalo = 3500;

// Fotos que se van fundiendo una tras otra dentro de una tarjeta de categoría.
// desfase hace que cada tarjeta cambie en un momento distinto y no todas a la vez.
export default function FotosRotativas({ fotos, desfase = 0 }) {
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return;
    let intervaloId;
    const inicio = setTimeout(() => {
      setActiva(a => (a + 1) % fotos.length);
      intervaloId = setInterval(() => setActiva(a => (a + 1) % fotos.length), intervalo);
    }, intervalo + desfase);
    return () => { clearTimeout(inicio); clearInterval(intervaloId); };
  }, [fotos.length, desfase]);

  return (
    <>
      {fotos.map((f, i) => (
        <Image key={f} src={f} alt="" fill sizes="(max-width: 720px) 100vw, 400px"
          className={`tarjeta-foto foto-rotativa${i === activa ? ' activa' : ''}`} />
      ))}
      {fotos.length > 1 && (
        <span className="rotativa-puntos" aria-hidden>
          {fotos.map((f, i) => <i key={f} className={i === activa ? 'activo' : ''} />)}
        </span>
      )}
    </>
  );
}
