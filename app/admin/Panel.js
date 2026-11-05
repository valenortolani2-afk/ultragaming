'use client';

import { useEffect, useState } from 'react';
import {
  CaretLeftIcon, CaretRightIcon, CurrencyDollarIcon, ImageIcon, ImagesIcon, PackageIcon, PencilSimpleIcon, ReceiptIcon, StarIcon, TrashIcon,
  UploadSimpleIcon, WhatsappLogoIcon
} from '@phosphor-icons/react';
import { escribirA, garantiaNuevos, garantiaOutlet, pesos } from '../../lib/contacto';

// Elegir garantía: 4 o 12 meses. Si un producto viejo tiene otra, se muestra también para no perderla.
function ElegirGarantia({ valor, cambiar }) {
  const opciones = [garantiaOutlet, garantiaNuevos];
  return (
    <select value={valor} onChange={e => cambiar(e.target.value)} required>
      {!opciones.includes(valor) && <option value={valor}>{valor}</option>}
      {opciones.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Sube una imagen a Cloudinary con el permiso firmado de /api/subir y devuelve su dirección
async function subirImagen(archivo, categoria, clave) {
  const r = await fetch('/api/subir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave, categoria })
  });
  const permiso = await r.json();
  if (!r.ok) throw new Error(permiso.error);
  const form = new FormData();
  for (const [k, v] of Object.entries(permiso.campos)) form.append(k, v);
  form.append('file', archivo);
  const subida = await fetch(permiso.url, { method: 'POST', body: form });
  const data = await subida.json();
  if (!subida.ok) throw new Error(data.error?.message || 'Cloudinary no aceptó la imagen');
  return data.secure_url;
}

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
  // Producto al que se le están editando título, precios, descripción o garantía
  const [datos, setDatos] = useState(null);
  const [guardandoDatos, setGuardandoDatos] = useState(false);

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
        fotos.push(await subirImagen(archivo, categoria, clave));
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

  function abrirDatos(p) {
    setDatos(datos?.url === p.url ? null : {
      url: p.url, nombre: p.nombre, precio: String(p.precio), costo: p.costo == null ? '' : String(p.costo),
      descripcion: p.descripcion || '', garantia: (p.garantia || '').trim().replace(/\s+/g, ' ').toLowerCase(), conCosto: 'costo' in p
    });
  }

  async function guardarDatos(e) {
    e.preventDefault();
    setError('');
    setGuardandoDatos(true);
    const { url, nombre, precio, costo, descripcion, garantia, conCosto } = datos;
    const r = await fetch('/api/publicaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, url, nombre, precio, descripcion, garantia, ...(conCosto && { costo }) })
    });
    setGuardandoDatos(false);
    if (!r.ok) return setError((await r.json()).error);
    setEstado(`Cambios guardados: ${nombre}`);
    setDatos(null);
    cargarLista();
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
          <button role="tab" aria-selected={vista === 'banners'} className={`filtro${vista === 'banners' ? ' activo' : ''}`} onClick={() => setVista('banners')}>
            <ImageIcon size={16} /> Banners
          </button>
        </div>
      </div>
      {estado && <p className="nota" role="status">{estado}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {vista === 'banners' ? <Banners clave={clave} setEstado={setEstado} setError={setError} /> :
       vista === 'ventas' ? <Ventas ventas={ventas} onBorrar={borrarVenta} /> : (
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
          <ElegirGarantia valor={garantia} cambiar={setGarantia} />
        </label>
        <label>Descripción
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={5000} rows={10} placeholder="Estado, componentes, qué incluye" />
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
                <button className="btn-icono" aria-label={`Editar ${p.nombre}`} aria-expanded={datos?.url === p.url} onClick={() => abrirDatos(p)}>
                  <PencilSimpleIcon size={16} />
                </button>
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
                {datos?.url === p.url && (
                  <form className="formulario editor-datos" onSubmit={guardarDatos} aria-label={`Editar ${p.nombre}`}>
                    <label>Título
                      <input value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))} maxLength={120} required />
                    </label>
                    {datos.conCosto && (
                      <label>Precio de costo en pesos (solo lo ves vos)
                        <input type="number" min="0" step="1" inputMode="numeric" value={datos.costo} onChange={e => setDatos(d => ({ ...d, costo: e.target.value }))} />
                      </label>
                    )}
                    <label>Precio de venta en pesos
                      <input type="number" min="1" step="1" inputMode="numeric" value={datos.precio} onChange={e => setDatos(d => ({ ...d, precio: e.target.value }))} required />
                    </label>
                    {datos.conCosto && datos.costo !== '' && datos.precio !== '' && (
                      <p className="nota">Ganancia: {pesos(Number(datos.precio) - Number(datos.costo))}</p>
                    )}
                    <label>Garantía
                      <ElegirGarantia valor={datos.garantia} cambiar={g => setDatos(d => ({ ...d, garantia: g }))} />
                    </label>
                    <label>Descripción
                      <textarea value={datos.descripcion} onChange={e => setDatos(d => ({ ...d, descripcion: e.target.value }))} maxLength={5000} rows={10} />
                    </label>
                    <div className="editor-acciones">
                      <button className="btn btn-azul btn-chico" disabled={guardandoDatos}>{guardandoDatos ? 'Guardando' : 'Guardar cambios'}</button>
                      <button type="button" className="btn btn-gris btn-chico" onClick={() => setDatos(null)}>Cancelar</button>
                    </div>
                  </form>
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

// Banners del carrusel de la portada: se suben, se ven y se borran. El más nuevo va primero, después de la foto del local.
function Banners({ clave, setEstado, setError }) {
  const [lista, setLista] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  async function cargar() {
    const r = await fetch('/api/banners');
    setLista(r.ok ? await r.json() : []);
  }
  useEffect(() => { cargar(); }, []);

  async function subir(e) {
    const archivos = [...e.target.files];
    const input = e.target;
    setError('');
    if (!clave) { input.value = ''; return setError('Escribí la contraseña del panel.'); }
    const grande = archivos.find(a => a.size > 10 * 1024 * 1024);
    if (grande) { input.value = ''; return setError(`La imagen ${grande.name} pesa más de 10 MB. Achicala y probá de nuevo.`); }
    setSubiendo(true);
    try {
      for (const [i, archivo] of archivos.entries()) {
        setEstado(`Subiendo banner ${i + 1} de ${archivos.length}`);
        await subirImagen(archivo, 'banners', clave);
      }
      await fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clave }) });
      setEstado(archivos.length === 1 ? 'Banner subido. Ya aparece en la portada.' : `${archivos.length} banners subidos. Ya aparecen en la portada.`);
      cargar();
    } catch (err) {
      setEstado('');
      setError(err.message.includes('Contraseña') ? 'La contraseña no es correcta.' : `No se pudo subir: ${err.message}`);
    } finally {
      setSubiendo(false);
      input.value = '';
    }
  }

  async function borrar(b) {
    if (!confirm('¿Borrar este banner? Deja de aparecer en la portada.')) return;
    setError('');
    const r = await fetch('/api/banners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, url: b.url })
    });
    if (!r.ok) return setError((await r.json()).error);
    setEstado('Banner borrado.');
    cargar();
  }

  return (
    <div className="banners-admin">
      <div className="formulario">
        <h2 className="subtitulo" style={{ marginBottom: 0 }}>Banners de la portada</h2>
        <p className="nota">Se muestran en el carrusel de arriba de la página, después de la foto del local. El último que subas va primero. Conviene que sean horizontales (por ejemplo 1920 × 1080 o 1536 × 1024).</p>
        <label className={`btn btn-azul subir-banner${subiendo ? ' deshabilitado' : ''}`}>
          <UploadSimpleIcon size={16} /> {subiendo ? 'Subiendo' : 'Subir banners'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={subir} disabled={subiendo} hidden />
        </label>
      </div>

      {lista === null ? <p className="nota">Cargando</p> : lista.length === 0 ? (
        <p className="nota">Todavía no subiste banners. Mientras tanto, la portada muestra solo la foto del local.</p>
      ) : (
        <ol className="lista-banners">
          {lista.map((b, i) => (
            <li key={b.url}>
              <img src={b.url} alt={`Banner ${i + 1}`} />
              <div>
                <strong>Banner {i + 1}</strong>
                <span>Subido el {fecha(b.fecha)}</span>
              </div>
              <button className="btn-icono" aria-label={`Borrar el banner ${i + 1}`} onClick={() => borrar(b)}><TrashIcon size={16} /></button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Teléfono del comprador: abre WhatsApp con un mensaje sobre su compra, sin tener que agendarlo
function Telefono({ venta }) {
  const { nombre, telefono } = venta.cliente;
  const link = escribirA(telefono, `Hola ${nombre}, te escribimos de Ultra Gaming por tu compra de "${venta.nombre}".`);
  if (!link) return <span>Tel. {telefono}</span>;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="link-wa" aria-label={`Escribirle por WhatsApp a ${nombre} al ${telefono}`}>
      <WhatsappLogoIcon size={14} weight="fill" /> {telefono}
    </a>
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
            <tr><th>Fecha</th><th>Producto</th><th>Comprador</th><th>Costo</th><th>Venta final</th><th>Ganancia</th><th><span className="sr-only">Acciones</span></th></tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id}>
                <td>{fecha(v.fecha)}</td>
                <td>
                  <strong>{v.nombre}</strong>
                  <span>{[v.categoria, v.origen && `${v.origen} N° ${v.pago}`].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="comprador">
                  {v.cliente ? (
                    <>
                      <strong>{v.cliente.nombre} {v.cliente.apellido}</strong>
                      <span>DNI {v.cliente.dni}</span>
                      <Telefono venta={v} />
                      <span>{v.cliente.direccion}, {v.cliente.localidad} (CP {v.cliente.codigoPostal})</span>
                      {v.comprador && <span>{v.comprador}</span>}
                    </>
                  ) : v.comprador ? <span>{v.comprador}</span> : <span>—</span>}
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
