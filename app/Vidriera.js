'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, ShieldCheckIcon, WhatsappLogoIcon, XIcon } from '@phosphor-icons/react';
import { consultar, garantia, pesos } from '../lib/contacto';

const precioTexto = p => (p.desde ? 'Desde ' : '') + pesos(p.precio);

export default function Vidriera({ productos }) {
  const [categoria, setCategoria] = useState('Todos');
  const [elegido, setElegido] = useState(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  const ficha = useRef(null);

  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))];
  const lista = categoria === 'Todos' ? productos : productos.filter(p => p.categoria === categoria);

  // Al tocar una foto se abre la ficha con info, precio y garantía
  function abrir(p) {
    setElegido(p);
    setFotoActiva(0);
    ficha.current.showModal();
  }
  const cerrar = () => ficha.current.close();

  return (
    <>
      <div className="filtros" role="group" aria-label="Categorías">
        {categorias.map(c => (
          <button key={c} className={'filtro' + (c === categoria ? ' activo' : '')} aria-pressed={c === categoria} onClick={() => setCategoria(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="vidriera">
        {lista.map(p => (
          // En la tarjeta solo van la foto y el título; el resto se ve al tocarla
          <button key={p.id} className="tarjeta" onClick={() => abrir(p)} aria-haspopup="dialog" aria-label={`Ver ${p.nombre}`}>
            <Image src={p.fotos[0]} alt="" fill sizes="(max-width: 720px) 100vw, 400px" className="tarjeta-foto" />
            <span className="tarjeta-info">
              <strong>{p.nombre}</strong>
            </span>
          </button>
        ))}
      </div>

      {/* Click en el fondo oscuro cierra la ficha */}
      <dialog ref={ficha} className="ficha" aria-labelledby="ficha-titulo" onClick={e => e.target === ficha.current && cerrar()}>
        {elegido && (
          <div className="ficha-grid">
            <div className="ficha-fotos">
              <Image src={elegido.fotos[fotoActiva]} alt={elegido.nombre} fill sizes="(max-width: 960px) 100vw, 480px" />
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
