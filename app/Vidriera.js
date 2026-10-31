'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, ShieldCheckIcon, ShoppingCartIcon, WhatsappLogoIcon, XIcon } from '@phosphor-icons/react';
import { consultar, garantia, pesos } from '../lib/contacto';
import { useCarrito } from './Carrito';

const precioTexto = p => (p.desde ? 'Desde ' : '') + pesos(p.precio);

// Si el borde de la foto es de un solo color (ej: producto sobre fondo blanco), devuelve ese color.
// Si es variado (una foto real), devuelve null y se usa la foto desenfocada de fondo.
function colorDelBorde(img) {
  try {
    const lado = 32;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = lado;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Las partes transparentes (PNG sin fondo) cuentan como blanco
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, lado, lado);
    ctx.drawImage(img, 0, 0, lado, lado);
    const { data } = ctx.getImageData(0, 0, lado, lado);
    const borde = [];
    for (let i = 0; i < lado; i++) for (const [x, y] of [[i, 0], [i, lado - 1], [0, i], [lado - 1, i]]) {
      const p = (y * lado + x) * 4;
      borde.push([data[p], data[p + 1], data[p + 2]]);
    }
    // Agrupa los colores parecidos del borde: si uno solo cubre la mayor parte, ese es el fondo
    const grupos = {};
    for (const px of borde) (grupos[px.map(v => v >> 5).join()] ??= []).push(px);
    const mayor = Object.values(grupos).sort((a, b) => b.length - a.length)[0];
    if (mayor.length < borde.length * 0.7) return null;
    const media = [0, 1, 2].map(c => Math.round(mayor.reduce((s, px) => s + px[c], 0) / mayor.length));
    return `rgb(${media.join(' ')})`;
  } catch { return null; }
}

// Grilla de publicaciones de una categoría. Al tocar una se abre su ficha.
export default function Vidriera({ productos }) {
  const [elegido, setElegido] = useState(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  // Color de relleno calculado para una foto; se guarda con su dirección para no mezclarlo con otra
  const [relleno, setRelleno] = useState({ src: null, color: null });
  const fotoVista = elegido?.fotos[fotoActiva];
  const fondo = relleno.src === fotoVista ? relleno.color : null;
  const medirRelleno = img => relleno.src !== fotoVista && setRelleno({ src: fotoVista, color: colorDelBorde(img) });
  const ficha = useRef(null);
  const { agregar } = useCarrito();

  // Al tocar una foto se abre la ficha con info, precio y garantía
  function abrir(p) {
    setElegido(p);
    setFotoActiva(0);
    ficha.current.showModal();
  }
  const cerrar = () => ficha.current.close();

  // Si la dirección termina en #<id> (viene del buscador), se abre la ficha de ese producto
  useEffect(() => {
    const desdeDireccion = () => {
      const p = productos.find(p => p.id === decodeURIComponent(location.hash.slice(1)));
      if (p && !ficha.current.open) abrir(p);
    };
    desdeDireccion();
    window.addEventListener('hashchange', desdeDireccion);
    return () => window.removeEventListener('hashchange', desdeDireccion);
  }, [productos]);
  // Al cerrar la ficha se saca el #, así el mismo resultado se puede volver a abrir
  const alCerrar = () => location.hash && history.replaceState(null, '', location.pathname + location.search);

  return (
    <>
      <div className="vidriera">
        {productos.map(p => (
          <article key={p.id} className="producto">
            {/* En la tarjeta van la foto y el título; el resto se ve al tocarla */}
            <button className="tarjeta" onClick={() => abrir(p)} aria-haspopup="dialog" aria-label={`Ver ${p.nombre}`}>
              <Image src={p.fotos[0]} alt="" fill sizes="(max-width: 720px) 100vw, 400px" className="tarjeta-foto" />
              <span className="tarjeta-info">
                <strong>{p.nombre}</strong>
              </span>
            </button>
            <div className="producto-compra">
              <span className="producto-precio">{precioTexto(p)}</span>
              {!p.desde && (
                <button className="btn btn-comprar" onClick={() => agregar(p)} aria-label={`Comprar ${p.nombre}`}>
                  <ShoppingCartIcon size={18} weight="bold" /> Comprar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Click en el fondo oscuro cierra la ficha */}
      <dialog ref={ficha} className="ficha" aria-labelledby="ficha-titulo" onClick={e => e.target === ficha.current && cerrar()} onClose={alCerrar}>
        {elegido && (
          <div className="ficha-grid">
            <div className="ficha-fotos" style={fondo ? { background: fondo } : undefined}>
              {/* El espacio que sobra se llena con el color del borde de la foto o, si no es parejo, con la foto desenfocada */}
              {!fondo && <Image src={elegido.fotos[fotoActiva]} alt="" aria-hidden fill sizes="64px" className="ficha-fondo" />}
              <Image src={elegido.fotos[fotoActiva]} alt={elegido.nombre} fill sizes="(max-width: 960px) 100vw, 480px" className="ficha-foto"
                onLoad={e => medirRelleno(e.currentTarget)}
                // Si la foto ya estaba en caché, onLoad a veces no llega: se mide apenas aparece
                ref={img => img?.complete && img.naturalWidth > 0 && medirRelleno(img)} />
              {elegido.fotos.length > 1 && (
                <div className="miniaturas">
                  {elegido.fotos.map((f, i) => (
                    <button key={f} className={i === fotoActiva ? 'activa' : ''} onClick={() => setFotoActiva(i)} aria-label={`Foto ${i + 1}`}>
                      <Image src={f} alt="" fill sizes="48px" style={{ objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ficha-texto">
              <div className="ficha-cabeza">
                <div>
                  <p className="etiqueta" style={{ marginBottom: 4 }}>{elegido.categoria}</p>
                  <h2 id="ficha-titulo">{elegido.nombre}</h2>
                </div>
                <button className="btn-icono" onClick={cerrar} aria-label="Cerrar" autoFocus><XIcon size={16} /></button>
              </div>

              <div className="ficha-precio">
                {precioTexto(elegido)}
                <small>Precio final. Consultá cuotas y formas de pago.</small>
              </div>

              {!elegido.desde && (
                <button className="btn btn-comprar btn-grande" onClick={() => { cerrar(); agregar(elegido); }}>
                  <ShoppingCartIcon size={20} weight="bold" /> Comprar
                </button>
              )}

              <div className="garantia-caja">
                <ShieldCheckIcon size={28} weight="fill" />
                <div>
                  <strong>Garantía de {elegido.garantia || garantia}</strong>
                  <span>Si falla, lo revisa nuestro servicio técnico y te lo resolvemos.</span>
                </div>
              </div>

              {elegido.descripcion && <p className="ficha-descripcion">{elegido.descripcion}</p>}
              {elegido.detalles?.length > 0 && <ul className="detalles">
                {elegido.detalles.map(d => <li key={d}><CheckIcon size={16} weight="bold" /> {d}</li>)}
              </ul>}

              <div className="ficha-acciones">
                {!elegido.desde && (
                  <button className="btn btn-comprar" onClick={() => { cerrar(); agregar(elegido); }}>
                    <ShoppingCartIcon size={16} weight="bold" /> Comprar
                  </button>
                )}
                <a className="btn btn-wa" target="_blank" rel="noopener noreferrer"
                  href={consultar(`Hola, quiero consultar por "${elegido.nombre}" (${precioTexto(elegido)}).`)}>
                  <WhatsappLogoIcon size={16} weight="fill" /> Consultar por WhatsApp
                </a>
                <button className="btn btn-gris" onClick={cerrar}>Seguir viendo</button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
