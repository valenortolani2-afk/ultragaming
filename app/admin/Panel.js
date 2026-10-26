'use client';

import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { pesos } from '../../lib/contacto';

export default function Panel({ categorias, garantiaBase }) {
  const [clave, setClave] = useState('');
  const [categoria, setCategoria] = useState(categorias[0].slug);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [garantia, setGarantia] = useState(garantiaBase);
  const [archivos, setArchivos] = useState([]);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [lista, setLista] = useState(null);

  // La contraseña se recuerda solo mientras la pestaña esté abierta
  useEffect(() => { try { setClave(sessionStorage.getItem('clave-admin') || ''); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem('clave-admin', clave); } catch {} }, [clave]);

  async function cargarLista() {
    setLista(null);
    const r = await fetch(`/api/publicaciones?categoria=${categoria}`);
    setLista(r.ok ? await r.json() : []);
  }
  useEffect(() => { cargarLista(); }, [categoria]);

  async function publicar(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');
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
        body: JSON.stringify({ clave, categoria, nombre, precio, descripcion, garantia, fotos })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEstado(`Publicado: ${data.nombre}`);
      setNombre(''); setPrecio(''); setDescripcion(''); setGarantia(garantiaBase); setArchivos([]);
      form.reset();
      cargarLista();
    } catch (err) {
      setEstado('');
      setError(err.message.includes('Contraseña') ? 'La contraseña no es correcta.' : `No se pudo publicar: ${err.message}`);
    } finally {
      setOcupado(false);
    }
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

  const nombreCategoria = categorias.find(c => c.slug === categoria).nombre;

  return (
    <div className="panel-admin">
      <form onSubmit={publicar} className="formulario">
        <label>Contraseña del panel
          <input type="password" value={clave} onChange={e => setClave(e.target.value)} autoComplete="current-password" required />
        </label>
        <label>Categoría
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            {categorias.map(c => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
          </select>
        </label>
        <label>Título
          <input value={nombre} onChange={e => setNombre(e.target.value)} maxLength={120} placeholder="Ej: PC Ryzen 5 5600 + RTX 3060 12 GB" required />
        </label>
        <label>Precio en pesos
          <input type="number" min="1" step="1" inputMode="numeric" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej: 850000" required />
        </label>
        <label>Garantía
          <input value={garantia} onChange={e => setGarantia(e.target.value)} maxLength={40} required />
        </label>
        <label>Descripción
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={1500} rows={5} placeholder="Estado, componentes, qué incluye" />
        </label>
        <label>Fotos (hasta 8, máximo 10 MB cada una)
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={e => setArchivos([...e.target.files])} required />
        </label>
        <button className="btn btn-azul" disabled={ocupado}>
          <UploadSimpleIcon size={16} /> {ocupado ? 'Publicando' : 'Publicar producto'}
        </button>
        {estado && <p className="nota" role="status">{estado}</p>}
        {error && <p className="error" role="alert">{error}</p>}
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
                  <span>{pesos(p.precio)} · Garantía {p.garantia} · {p.fotos.length} {p.fotos.length === 1 ? 'foto' : 'fotos'}</span>
                </div>
                <button className="btn-icono" aria-label={`Borrar ${p.nombre}`} onClick={() => borrar(p)}><TrashIcon size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
