'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { pesos } from '../lib/contacto';

// Botón "Buscar" de la barra. Abre una caja debajo de la barra con resultados mientras se escribe;
// con Enter se va a /buscar con todos los resultados.
export default function Buscador() {
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState(null);
  const caja = useRef(null);
  const boton = useRef(null);
  const pedido = useRef(0);

  // Espera a que se deje de escribir y descarta respuestas de búsquedas anteriores
  useEffect(() => {
    if (!q.trim()) return setResultados(null);
    const numero = ++pedido.current;
    const espera = setTimeout(async () => {
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(q.trim())}`);
        const data = await r.json();
        if (numero === pedido.current) setResultados(data);
      } catch {}
    }, 250);
    return () => clearTimeout(espera);
  }, [q]);

  // Se cierra con Escape o tocando fuera de la caja
  useEffect(() => {
    if (!abierto) return;
    const tecla = e => e.key === 'Escape' && cerrar();
    const toque = e => !caja.current?.contains(e.target) && !boton.current?.contains(e.target) && setAbierto(false);
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', toque);
    return () => { document.removeEventListener('keydown', tecla); document.removeEventListener('pointerdown', toque); };
  }, [abierto]);

  function cerrar() { setAbierto(false); boton.current?.focus(); }

  const consulta = encodeURIComponent(q.trim());
  const nada = resultados && !resultados.productos.length && !resultados.categorias.length;

  return (
    <>
      <button ref={boton} className="btn-icono buscador-btn" aria-label="Buscar" aria-expanded={abierto} aria-controls="buscador-caja" onClick={() => setAbierto(a => !a)}>
        <MagnifyingGlassIcon size={16} /> <span>Buscar</span>
      </button>

      {abierto && (
        <div ref={caja} id="buscador-caja" className="buscador-caja">
          <form action="/buscar" role="search" className="buscador-form">
            <MagnifyingGlassIcon size={18} aria-hidden />
            <input type="search" name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar productos y categorías"
              aria-label="Buscar productos y categorías" autoComplete="off" maxLength={80} autoFocus required />
            <button type="button" className="btn-icono" onClick={cerrar} aria-label="Cerrar buscador"><XIcon size={16} /></button>
          </form>

          {resultados && (
            <div className="buscador-resultados" aria-live="polite">
              {nada && <p className="nota">No encontramos nada con “{q.trim()}”. Probá con otra palabra.</p>}

              {resultados.categorias.length > 0 && (
                <div className="filtros">
                  {resultados.categorias.map(c => <a key={c.slug} href={`/categoria/${c.slug}`} className="filtro">{c.titulo}</a>)}
                </div>
              )}

              {resultados.productos.length > 0 && (
                <ul>
                  {resultados.productos.map(p => (
                    <li key={p.id}>
                      {/* El # abre la ficha del producto apenas carga la categoría */}
                      <a href={`/categoria/${p.slug}#${p.id}`} onClick={() => setAbierto(false)}>
                        <span className="buscador-foto"><Image src={p.foto} alt="" fill sizes="48px" /></span>
                        <span className="buscador-texto">
                          <strong>{p.nombre}</strong>
                          <span>{p.categoria} · {p.desde ? 'Desde ' : ''}{pesos(p.precio)}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {resultados.total > resultados.productos.length && (
                <a href={`/buscar?q=${consulta}`} className="btn btn-gris btn-chico buscador-todos">Ver los {resultados.total} resultados</a>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
