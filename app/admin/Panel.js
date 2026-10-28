'use client';

import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';
import {
  CaretLeftIcon, CaretRightIcon, CurrencyDollarIcon, ImagesIcon, PackageIcon, ReceiptIcon, StarIcon, TrashIcon, UploadSimpleIcon
} from '@phosphor-icons/react';
import { pesos } from '../../lib/contacto';

export default function Panel({ categorias, garantiaBase }) {
  const [clave, setClave] = useState('');
  const [categoria, setCategoria] = useState(categorias[0].slug);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costo, setCosto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [garantia, setGarantia] = useState(garantiaBase);
  const [archivos, setArchivos] = useState([]);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [lista, setLista] = useState(null);
  const [vista, setVista] = useState('productos');
  const [ventas, setVentas] = useState(null);
  // Contraseña con la que se pidió la lista: los costos solo llegan si es correcta
  const [claveLista, setClaveLista] = useState('');
  // Producto al que se le está cambiando el orden de las fotos
  const [editando, setEditando] = useState(null);
  const [guardandoOrden, setGuardandoOrden] = useState(false);

  // Vistas previas de las fotos elegidas para publicar
  const [previas, setPrevias] = useState([]);
  useEffect(() => {
    const urls = archivos.map(a => URL.createObjectURL(a));
    setPrevias(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [archivos]);

  // La contraseña se recuerda solo mientras la pestaña esté abierta
  useEffect(() => {
    try { const c = sessionStorage.getItem('clave-admin') || ''; setClave(c); setClaveLista(c); } catch {}
  }, []);
  useEffect(() => { try { sessionStorage.setItem('clave-admin', clave); } catch {} }, [clave]);

  async function cargarLista() {
    setLista(null);
    const r = await fetch(`/api/publicaciones?categoria=${categoria}`, { headers: { 'x-clave': claveLista } });
    setLista(r.ok ? await r.json() : []);
  }
  useEffect(() => { cargarLista(); }, [categoria, claveLista]);

  async function publicar(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');
    if (!clave) return setError('Escribí la contraseña del panel.');
    if (!archivos.length) return setError('Elegí al menos una foto.');
    if (archivos.length > 8) return setError('Podés subir hasta 8 fotos por producto.');
    const grande = archivos.find(a => a.size > 10 * 1024 * 1024);
    if (grande) return setError(`La foto ${grande.name} pesa más de 10 MB. Achicala y probá de nuevo.`);
    setOcupado(true);
    try {
      const fotos = [];
      for (const [i, archivo] of archivos.entries()) {
        setEstado(`Subiendo foto ${i + 1} de ${archivos.length}`);
        const nombreArchivo = archivo.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
        const blob = await upload(`fotos/${categoria}/${nombreArchivo}`, archivo, {
          access: 'public', handleUploadUrl: '/api/subir', clientPayload: clave
        });
        fotos.push(blob.url);
      }
      setEstado('Guardando el producto');
      const r = await fetch('/api/publicaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave, categoria, nombre, precio, costo, descripcion, garantia, fotos })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEstado(`Publicado: ${data.nombre}`);
      setNombre(''); setPrecio(''); setCosto(''); setDescripcion(''); setGarantia(garantiaBase); setArchivos([]);
      form.reset();
      cargarLista();
    } catch (err) {
      setEstado('');
      setError(err.message.includes('Contraseña') ? 'La contraseña no es correcta.' : `No se pudo publicar: ${err.message}`);
    } finally {
      setOcupado(false);
    }
  }

  async function guardarOrden() {
    setError('');
    setGuardandoOrden(true);
    const r = await fetch('/api/publicaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, url: editando.url, fotos: editando.fotos })
    });
    setGuardandoOrden(false);
    if (!r.ok) return setError((await r.json()).error);
    setEstado(`Orden de fotos guardado: ${editando.nombre}`);
    setLista(l => l.map(p => p.url === editando.url ? { ...p, fotos: editando.fotos } : p));
    setEditando(null);
  }

  async function borrar(p) {
    if (!confirm(`¿Borrar "${p.nombre}"? También se borran sus fotos.`)) return;
    setError('');
    const r = await fetch('/api/publicaciones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, url: p.url })
    });
    if (!r.ok) return setError((await r.json()).error);
    setEstado(`Borrado: ${p.nombre}`);
    cargarLista();
  }

  // Registra la venta con el precio final (puede diferir del publicado) y opcionalmente saca el producto
  async function vender(p) {
    const texto = prompt(`Precio final de venta de "${p.nombre}"`, String(p.precio));
    if (texto === null) return;
    const precioFinal = Number(texto.replace(/[^\d]/g, ''));
    if (!(precioFinal > 0)) return setError('El precio final tiene que ser un número mayor a cero.');
    const quitar = confirm('¿Sacar el producto de la vidriera?\n\nAceptar: se borra la publicación y sus fotos.\nCancelar: queda publicado (por ejemplo, si tenés más stock).');
    setError('');
    const r = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, url: p.url, precio: precioFinal, quitar })
    });
    if (!r.ok) return setError((await r.json()).error);
    setEstado(`Venta registrada: ${p.nombre} por ${pesos(precioFinal)}`);
    cargarLista();
  }

  async function cargarVentas() {
    setVentas(null);
    const r = await fetch('/api/ventas', { headers: { 'x-clave': claveLista } });
    setVentas(r.ok ? await r.json() : 'sin-clave');
  }
  useEffect(() => { if (vista === 'ventas') cargarVentas(); }, [vista, claveLista]);

  async function borrarVenta(v) {
    if (!confirm(`¿Borrar la venta de "${v.nombre}"? El producto no vuelve a la vidriera.`)) return;
    setError('');
    const r = await fetch('/api/ventas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, url: v.url })
    });
    if (!r.ok) return setError((await r.json()).error);
    cargarVentas();
  }

  const nombreCategoria = categorias.find(c => c.slug === categoria).nombre;

  return (
    <>
      <div className="admin-barra">
        <label>Contraseña del panel
          <input type="password" value={clave} onChange={e => setClave(e.target.value)} onBlur={() => setClaveLista(clave)} autoComplete="current-password" />
        </label>
        <div className="filtros" role="tablist">
          <button role="tab" aria-selected={vista === 'productos'} className={`filtro${vista === 'productos' ? ' activo' : ''}`} onClick={() => setVista('productos')}>
            <PackageIcon size={16} /> Productos
          </button>
          <button role="tab" aria-selected={vista === 'ventas'} className={`filtro${vista === 'ventas' ? ' activo' : ''}`} onClick={() => setVista('ventas')}>
            <ReceiptIcon size={16} /> Ventas
          </button>
        </div>
      </div>
      {estado && <p className="nota" role="status">{estado}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {vista === 'ventas' ? <Ventas ventas={ventas} onBorrar={borrarVenta} /> : (
    <div className="panel-admin">
      <form onSubmit={publicar} className="formulario">
        <label>Categoría
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            {categorias.map(c => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
          </select>
        </label>
        <label>Título
          <input value={nombre} onChange={e => setNombre(e.target.value)} maxLength={120} placeholder="Ej: PC Ryzen 5 5600 + RTX 3060 12 GB" required />
        </label>
        <label>Precio de costo en pesos (solo lo ves vos)
          <input type="number" min="0" step="1" inputMode="numeric" value={costo} onChange={e => setCosto(e.target.value)} placeholder="Ej: 650000" required />
        </label>
        <label>Precio de venta en pesos (se ve en la publicación)
          <input type="number" min="1" step="1" inputMode="numeric" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej: 850000" required />
        </label>
        {costo !== '' && precio !== '' && (
          <p className="nota">Ganancia: {pesos(Number(precio) - Number(costo))}</p>
        )}
        <label>Garantía
          <input value={garantia} onChange={e => setGarantia(e.target.value)} maxLength={40} required />
        </label>
        <label>Descripción
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={1500} rows={5} placeholder="Estado, componentes, qué incluye" />
        </label>
        <label>Fotos (hasta 8, máximo 10 MB cada una)
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={e => setArchivos([...e.target.files])} required />
        </label>
        {archivos.length > 1 && previas.length === archivos.length && (
          <OrdenFotos srcs={previas} onOrden={orden => setArchivos(orden.map(i => archivos[i]))} />
        )}
        <button className="btn btn-azul" disabled={ocupado}>
          <UploadSimpleIcon size={16} /> {ocupado ? 'Publicando' : 'Publicar producto'}
        </button>
      </form>

      <div>
        <h2 className="subtitulo">Subidos en {nombreCategoria}</h2>
        {lista === null ? <p className="nota">Cargando</p> : lista.length === 0 ? (
          <p className="nota">Todavía no subiste productos en esta categoría.</p>
        ) : (
          <ul className="lista-admin">
            {lista.map(p => (
              <li key={p.id}>
                <img src={p.fotos[0]} alt="" />
                <div>
                  <h4>{p.nombre}</h4>
                  <span>
                    Venta {pesos(p.precio)}
                    {'costo' in p && (p.costo === null ? ' · Sin costo cargado' : ` · Costo ${pesos(p.costo)} · Ganancia ${pesos(p.precio - p.costo)}`)}
                    {' '}· Garantía {p.garantia} · {p.fotos.length} {p.fotos.length === 1 ? 'foto' : 'fotos'}</span>
                </div>
                {p.fotos.length > 1 && (
                  <button className="btn-icono" aria-label={`Ordenar las fotos de ${p.nombre}`} aria-expanded={editando?.url === p.url}
                    onClick={() => setEditando(editando?.url === p.url ? null : { url: p.url, nombre: p.nombre, fotos: p.fotos })}>
                    <ImagesIcon size={16} />
                  </button>
                )}
                <button className="btn btn-gris btn-chico" onClick={() => vender(p)}><CurrencyDollarIcon size={16} /> Vendido</button>
                <button className="btn-icono" aria-label={`Borrar ${p.nombre}`} onClick={() => borrar(p)}><TrashIcon size={16} /></button>
                {editando?.url === p.url && (
                  <section className="editor-fotos" aria-label={`Orden de las fotos de ${p.nombre}`}>
                    <OrdenFotos srcs={editando.fotos} onOrden={orden => setEditando(e => ({ ...e, fotos: orden.map(i => e.fotos[i]) }))} />
                    <div className="editor-acciones">
                      <button className="btn btn-azul btn-chico" onClick={guardarOrden}
                        disabled={guardandoOrden || editando.fotos.join() === p.fotos.join()}>
                        {guardandoOrden ? 'Guardando' : 'Guardar orden'}
                      </button>
                      <button className="btn btn-gris btn-chico" onClick={() => setEditando(null)}>Cancelar</button>
                    </div>
                  </section>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
      )}
    </>
  );
}

// Fotos en fila: la primera es la portada. Se puede poner cualquiera primera o moverla un lugar.
// onOrden recibe el nuevo orden como lista de posiciones originales.
function OrdenFotos({ srcs, onOrden }) {
  const posiciones = srcs.map((_, i) => i);
  const mover = (de, a) => {
    const orden = [...posiciones];
    orden.splice(a, 0, orden.splice(de, 1)[0]);
    onOrden(orden);
  };
  return (
    <div className="orden-fotos">
      <p className="nota">La primera foto es la portada del producto.</p>
      <ol>
        {srcs.map((src, i) => (
          <li key={src} className={i === 0 ? 'portada' : ''}>
            <img src={src} alt={`Foto ${i + 1}`} />
            {i === 0 ? <span className="sello"><StarIcon size={12} weight="fill" /> Portada</span> : (
              <button type="button" className="sello" onClick={() => mover(i, 0)}>Poner primera</button>
            )}
            <div className="flechas">
              <button type="button" onClick={() => mover(i, i - 1)} disabled={i === 0} aria-label={`Mover la foto ${i + 1} a la izquierda`}><CaretLeftIcon size={14} /></button>
              <button type="button" onClick={() => mover(i, i + 1)} disabled={i === srcs.length - 1} aria-label={`Mover la foto ${i + 1} a la derecha`}><CaretRightIcon size={14} /></button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const fecha = iso => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Resumen y detalle de las ventas registradas
function Ventas({ ventas, onBorrar }) {
  if (ventas === null) return <p className="nota">Cargando ventas</p>;
  if (ventas === 'sin-clave') return <p className="nota">Escribí la contraseña del panel para ver las ventas.</p>;
  if (ventas.length === 0) return <p className="nota">Todavía no registraste ventas. Usá el botón Vendido en la lista de productos.</p>;

  const total = ventas.reduce((s, v) => s + v.precio, 0);
  const conCosto = ventas.filter(v => v.costo !== null);
  const costoTotal = conCosto.reduce((s, v) => s + v.costo, 0);
  const ganancia = conCosto.reduce((s, v) => s + v.precio - v.costo, 0);

  return (
    <div className="ventas">
      <div className="ventas-resumen">
        <div><span>Ventas</span><strong>{ventas.length}</strong></div>
        <div><span>Total vendido</span><strong>{pesos(total)}</strong></div>
        <div><span>Costo total</span><strong>{pesos(costoTotal)}</strong></div>
        <div><span>Ganancia</span><strong className={ganancia < 0 ? 'negativo' : 'positivo'}>{pesos(ganancia)}</strong></div>
      </div>
      {conCosto.length < ventas.length && (
        <p className="nota">{ventas.length - conCosto.length} {ventas.length - conCosto.length === 1 ? 'venta no tiene' : 'ventas no tienen'} costo cargado y no {ventas.length - conCosto.length === 1 ? 'suma' : 'suman'} al costo ni a la ganancia.</p>
      )}
      <div className="tabla-ventas">
        <table>
          <thead>
            <tr><th>Fecha</th><th>Producto</th><th>Costo</th><th>Venta final</th><th>Ganancia</th><th><span className="sr-only">Acciones</span></th></tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id}>
                <td>{fecha(v.fecha)}</td>
                <td>
                  <strong>{v.nombre}</strong>
                  <span>{[v.categoria, v.origen && `${v.origen} N° ${v.pago}`, v.comprador].filter(Boolean).join(' · ')}</span>
                </td>
                <td>{v.costo === null ? 'Sin cargar' : pesos(v.costo)}</td>
                <td>{pesos(v.precio)}</td>
                <td className={v.costo === null ? '' : v.precio - v.costo < 0 ? 'negativo' : 'positivo'}>
                  {v.costo === null ? '—' : pesos(v.precio - v.costo)}
                </td>
                <td><button className="btn-icono" aria-label={`Borrar la venta de ${v.nombre}`} onClick={() => onBorrar(v)}><TrashIcon size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
