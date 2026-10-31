'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, ProhibitIcon, ShoppingCartIcon, TrashIcon, WhatsappLogoIcon, XIcon } from '@phosphor-icons/react';
import { consultar, pesos } from '../../lib/contacto';
import { marcaDe } from '../../lib/marcas';
import { fuenteRecomendada, motivoIncompatible, notaDelPaso, pasos, plataforma } from '../../lib/armado';
import { useCarrito } from '../Carrito';

const clave = 'armado-ultra-gaming';
// "Memoria RAM" → "memoria RAM", para usarlo dentro de una frase
const minuscula = t => t[0].toLowerCase() + t.slice(1);
const precioTexto = p => (p.desde ? 'Desde ' : '') + pesos(p.precio);

// Armador de PC: un paso por pieza, con las opciones del stock publicado.
// Lo que no va con lo ya elegido se muestra aparte, con el motivo, y no se puede elegir.
export default function Armador({ productos }) {
  // { base: idDelProducto, video: ..., ... }
  const [ids, setIds] = useState({});
  const [cargado, setCargado] = useState(false);
  const [activo, setActivo] = useState(0);
  const [marca, setMarca] = useState(null);
  const [orden, setOrden] = useState('menor');
  const { agregarVarios } = useCarrito();

  // Lo elegido se recuerda en este navegador, por si el cliente se va y vuelve
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(clave)) || {}); } catch {}
    setCargado(true);
  }, []);
  useEffect(() => { if (cargado) try { localStorage.setItem(clave, JSON.stringify(ids)); } catch {} }, [ids, cargado]);

  const porPaso = Object.fromEntries(pasos.map(s => [s.id, productos.filter(p => s.categorias.includes(p.slug))]));
  // Si algo elegido ya no está publicado, simplemente deja de contar
  const elegidos = Object.fromEntries(pasos.map(s => [s.id, porPaso[s.id].find(p => p.id === ids[s.id])]).filter(([, p]) => p));

  const paso = pasos[activo];
  const lista = porPaso[paso.id];
  const conMotivo = lista.map(p => ({ p, motivo: motivoIncompatible(paso.id, p, elegidos) }));
  const marcasPaso = [...new Set(lista.map(p => marcaDe(p) || 'Otras'))].sort((a, b) => (a === 'Otras') - (b === 'Otras') || a.localeCompare(b));
  const filtrados = conMotivo
    .filter(({ p }) => !marca || (marcaDe(p) || 'Otras') === marca)
    .sort((a, b) => orden === 'menor' ? a.p.precio - b.p.precio : b.p.precio - a.p.precio);
  const compatibles = filtrados.filter(o => !o.motivo);
  const noVan = filtrados.filter(o => o.motivo);

  function irA(i) {
    setActivo(i);
    setMarca(null);
    document.getElementById('armado')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function elegir(p) {
    const yaEstaba = ids[paso.id] === p.id;
    setIds(v => ({ ...v, [paso.id]: yaEstaba ? undefined : p.id }));
    // Al elegir, pasa solo al próximo paso
    if (!yaEstaba && activo < pasos.length - 1) irA(activo + 1);
  }
  const quitar = id => setIds(v => ({ ...v, [id]: undefined }));

  const piezas = pasos.filter(s => elegidos[s.id]).map(s => elegidos[s.id]);
  const total = piezas.reduce((s, p) => s + p.precio, 0);
  const base = plataforma(elegidos);
  const placa = elegidos.video?.datos;
  const recomendada = placa?.consumo ? fuenteRecomendada(placa.consumo) : null;
  const notas = Object.fromEntries(pasos.map(s => [s.id, notaDelPaso(s.id, elegidos)]));
  const nota = notas[paso.id];

  // Pasos obligatorios sin elegir (y que ninguna otra pieza cubre)
  const faltan = pasos.filter(s => !s.opcional && !elegidos[s.id] && !notas[s.id]?.cubierto).map(s => minuscula(s.titulo));

  const mensaje = [
    'Hola Ultra Gaming, armé esta PC en la página:',
    ...pasos.filter(s => elegidos[s.id]).map(s => `• ${s.titulo}: ${elegidos[s.id].nombre} (${precioTexto(elegidos[s.id])})`),
    `Total: ${pesos(total)}`,
    faltan.length ? `Me falta elegir: ${faltan.join(', ')}.` : ''
  ].filter(Boolean).join('\n');

  return (
    <div className="armado" id="armado">
      <ol className="armado-pasos">
        {pasos.map((s, i) => (
          <li key={s.id}>
            <button className={`armado-paso${i === activo ? ' activo' : ''}${elegidos[s.id] || notas[s.id]?.cubierto ? ' listo' : ''}`} onClick={() => irA(i)} aria-current={i === activo ? 'step' : undefined}>
              <b>{elegidos[s.id] || notas[s.id]?.cubierto ? <CheckIcon size={14} weight="bold" /> : i + 1}</b>
              <span>{s.titulo}{s.opcional && <small> (opcional)</small>}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="armado-grid">
        <section className="armado-opciones" aria-labelledby="paso-titulo">
          <div className="armado-cabeza">
            <div>
              <h2 id="paso-titulo">{activo + 1}. {paso.titulo}</h2>
              <p>{paso.ayuda}</p>
            </div>
            {lista.length > 1 && (
              <label className="armado-orden">
                Ordenar
                <select value={orden} onChange={e => setOrden(e.target.value)}>
                  <option value="menor">Menor precio</option>
                  <option value="mayor">Mayor precio</option>
                </select>
              </label>
            )}
          </div>

          {nota && <p className="armado-aviso"><CheckIcon size={16} weight="bold" /> {nota.texto}</p>}

          {marcasPaso.length > 1 && (
            <div className="filtros armado-marcas" role="group" aria-label="Filtrar por marca">
              <button className={`filtro${marca === null ? ' activo' : ''}`} aria-pressed={marca === null} onClick={() => setMarca(null)}>Todas</button>
              {marcasPaso.map(m => (
                <button key={m} className={`filtro${marca === m ? ' activo' : ''}`} aria-pressed={marca === m} onClick={() => setMarca(m)}>{m}</button>
              ))}
            </div>
          )}

          {lista.length === 0 ? (
            <div className="vacio">
              <h2>Por ahora no hay stock publicado de {minuscula(paso.titulo)}</h2>
              <p>Te lo conseguimos: consultanos por WhatsApp y te pasamos opciones compatibles.</p>
              <div className="armado-acciones-paso">
                <a href={consultar(`Hola, estoy armando una PC y busco ${minuscula(paso.titulo)}.`)} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
                  <WhatsappLogoIcon size={16} weight="fill" /> Consultar
                </a>
                {activo < pasos.length - 1 && <button className="btn btn-gris" onClick={() => irA(activo + 1)}>Saltear este paso <ArrowRightIcon size={16} /></button>}
              </div>
            </div>
          ) : (
            <>
              <div className="armado-lista">
                {compatibles.map(({ p }) => <Opcion key={p.id} p={p} elegida={ids[paso.id] === p.id} onElegir={() => elegir(p)} />)}
              </div>
              {compatibles.length === 0 && <p className="armado-nada">Ninguna de estas va con lo que elegiste. Cambiá alguna pieza del resumen o consultanos.</p>}
              {noVan.length > 0 && (
                <details className="armado-no-van">
                  <summary><ProhibitIcon size={16} /> No van con lo que elegiste ({noVan.length})</summary>
                  <div className="armado-lista">
                    {noVan.map(({ p, motivo }) => <Opcion key={p.id} p={p} motivo={motivo} />)}
                  </div>
                </details>
              )}
              {(paso.opcional || nota?.cubierto || nota?.corta) && activo < pasos.length - 1 && (
                <button className="btn btn-gris armado-saltear" onClick={() => irA(activo + 1)}>Saltear este paso <ArrowRightIcon size={16} /></button>
              )}
            </>
          )}
        </section>

        <aside className="armado-resumen" id="resumen" aria-label="Tu PC">
          <h2>Tu PC</h2>
          <ul>
            {pasos.map((s, i) => {
              const p = elegidos[s.id];
              return (
                <li key={s.id} className={p ? 'con-pieza' : ''}>
                  <button className="armado-resumen-paso" onClick={() => irA(i)}>
                    <span className="armado-mini">{p && <Image src={p.fotos[0]} alt="" fill sizes="48px" />}</span>
                    <span>
                      <small>{s.titulo}</small>
                      {p ? <strong>{p.nombre}</strong> : <em>{notas[s.id]?.resumen || 'Sin elegir'}</em>}
                      {p && <b>{precioTexto(p)}</b>}
                    </span>
                  </button>
                  {p && <button className="btn-icono armado-quitar" onClick={() => quitar(s.id)} aria-label={`Quitar ${p.nombre}`}><XIcon size={14} /></button>}
                </li>
              );
            })}
          </ul>

          {(base.socket || base.memoria || recomendada) && (
            <dl className="armado-datos">
              {base.socket && <><dt>Socket</dt><dd>{base.socket}</dd></>}
              {base.memoria && <><dt>Memoria</dt><dd>{base.memoria}</dd></>}
              {recomendada && <><dt>Fuente sugerida</dt><dd>{recomendada} W</dd></>}
            </dl>
          )}
          {piezas.length > 0 && faltan.length > 0 && <p className="armado-faltan">Te falta elegir: {faltan.join(', ')}.</p>}

          <div className="armado-total">
            <span>Total</span>
            <strong>{pesos(total)}</strong>
          </div>
          <button className="btn btn-comprar btn-grande" disabled={!piezas.some(p => !p.desde)} onClick={() => agregarVarios(piezas.filter(p => !p.desde))}>
            <ShoppingCartIcon size={20} weight="bold" /> Agregar al carrito
          </button>
          <a href={consultar(mensaje)} className={`btn btn-wa armado-wa${piezas.length ? '' : ' apagado'}`} target="_blank" rel="noopener noreferrer"
            aria-disabled={!piezas.length || undefined} onClick={e => !piezas.length && e.preventDefault()}>
            <WhatsappLogoIcon size={16} weight="fill" /> Enviar por WhatsApp
          </a>
          {piezas.length > 0 && (
            <button className="armado-vaciar" onClick={() => { setIds({}); irA(0); }}><TrashIcon size={14} /> Empezar de nuevo</button>
          )}
          <p className="armado-lista-pc">¿Preferís una PC lista? <Link href="/categoria/pcs-outlet">Mirá las PCs outlet</Link></p>
        </aside>
      </div>

      {/* En celular, el total queda siempre a mano abajo */}
      <a href="#resumen" className="armado-barra">
        <span>{piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'}</span>
        <strong>{pesos(total)}</strong>
        <span className="armado-barra-ver">Ver mi PC</span>
      </a>
    </div>
  );
}

function Opcion({ p, elegida, motivo, onElegir }) {
  return (
    <article className={`opcion${elegida ? ' elegida' : ''}${motivo ? ' no-va' : ''}`}>
      <div className="opcion-foto"><Image src={p.fotos[0]} alt="" fill sizes="(max-width: 720px) 40vw, 200px" /></div>
      <div className="opcion-texto">
        <strong>{p.nombre}</strong>
        <span className="opcion-precio">{precioTexto(p)}</span>
        {motivo && <span className="opcion-motivo"><ProhibitIcon size={14} /> {motivo}</span>}
        <div className="opcion-acciones">
          {!motivo && (
            <button className={`btn btn-chico ${elegida ? 'btn-comprar' : 'btn-azul'}`} onClick={onElegir} aria-pressed={elegida}>
              {elegida ? <><CheckIcon size={14} weight="bold" /> Elegida</> : 'Elegir'}
            </button>
          )}
          <Link href={`/categoria/${p.slug}#${encodeURIComponent(p.id)}`} className="opcion-ver" target="_blank">Ver detalle</Link>
        </div>
      </div>
    </article>
  );
}
