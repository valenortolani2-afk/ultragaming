'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeftIcon, MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { pesos } from '../lib/contacto';

// El carrito vive en el navegador del cliente. Al pagar, el servidor vuelve a leer
// el precio de cada producto, así que lo que se guarda acá es solo para mostrar.
const Contexto = createContext(null);
const clave = 'carrito-ultra-gaming';
const maximo = 10;

// Datos que se le piden al comprador antes de pagar
const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre', autoComplete: 'given-name', maxLength: 60 },
  { nombre: 'apellido', etiqueta: 'Apellido', autoComplete: 'family-name', maxLength: 60 },
  { nombre: 'dni', etiqueta: 'DNI', inputMode: 'numeric', pattern: '\\d{7,8}', title: 'El DNI tiene 7 u 8 números, sin puntos', maxLength: 8 },
  { nombre: 'telefono', etiqueta: 'Teléfono', type: 'tel', autoComplete: 'tel', placeholder: 'Ej: 11 2345 6789', maxLength: 20 },
  { nombre: 'codigoPostal', etiqueta: 'Código postal', autoComplete: 'postal-code', maxLength: 8 },
  { nombre: 'localidad', etiqueta: 'Localidad', autoComplete: 'address-level2', maxLength: 80 },
  { nombre: 'direccion', etiqueta: 'Dirección', autoComplete: 'street-address', placeholder: 'Calle, número, piso y depto', maxLength: 120 }
];
const sinDatos = Object.fromEntries(campos.map(c => [c.nombre, '']));

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState('');
  // 'carrito' muestra los productos; 'datos' pide los datos del comprador
  const [paso, setPaso] = useState('carrito');
  const [comprador, setComprador] = useState(sinDatos);
  const panel = useRef(null);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(clave)) || []); } catch {}
    // Los datos del comprador se recuerdan solo mientras la pestaña esté abierta, por si vuelve de Mercado Pago
    try { setComprador({ ...sinDatos, ...JSON.parse(sessionStorage.getItem('comprador')) }); } catch {}
    setCargado(true);
  }, []);
  useEffect(() => { if (cargado) try { localStorage.setItem(clave, JSON.stringify(items)); } catch {} }, [items, cargado]);
  useEffect(() => { if (cargado) try { sessionStorage.setItem('comprador', JSON.stringify(comprador)); } catch {} }, [comprador, cargado]);

  const abrir = () => { setError(''); setPaso('carrito'); panel.current?.showModal(); };
  const cerrar = () => panel.current?.close();

  function agregar(p) {
    setItems(lista => {
      const ya = lista.find(i => i.id === p.id);
      if (ya) return lista.map(i => i.id === p.id ? { ...i, cantidad: Math.min(i.cantidad + 1, maximo) } : i);
      return [...lista, { id: p.id, slug: p.slug, nombre: p.nombre, precio: p.precio, foto: p.fotos[0], cantidad: 1 }];
    });
    abrir();
  }
  const cambiar = (id, cantidad) => setItems(lista => lista.map(i => i.id === id ? { ...i, cantidad: Math.max(1, Math.min(cantidad, maximo)) } : i));
  const quitar = id => setItems(lista => lista.filter(i => i.id !== id));
  // Borra también lo guardado, por si se llama antes de que el carrito termine de cargarse
  const vaciar = () => { try { localStorage.removeItem(clave); } catch {} setItems([]); };

  const unidades = items.reduce((s, i) => s + i.cantidad, 0);
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  // Pide al servidor el link de pago de Mercado Pago y lleva al cliente ahí
  async function pagar(e) {
    e.preventDefault();
    setError('');
    setPagando(true);
    try {
      const r = await fetch('/api/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(({ id, slug, cantidad }) => ({ id, slug, cantidad })), comprador })
      });
      const data = await r.json();
      // Si algún producto ya no está o cambió de precio, el carrito se actualiza con lo que dice el servidor
      if (data.items) setItems(data.items);
      if (r.status === 409) setPaso('carrito');
      if (!r.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el pago. Probá de nuevo.');
      setPagando(false);
    }
  }

  return (
    <Contexto.Provider value={{ items, unidades, agregar, abrir, vaciar }}>
      {children}

      <dialog ref={panel} className="carrito" aria-labelledby="carrito-titulo" onClick={e => e.target === panel.current && cerrar()}>
        <div className="carrito-cabeza">
          {paso === 'datos' && items.length > 0 && (
            <button className="btn-icono" onClick={() => { setError(''); setPaso('carrito'); }} aria-label="Volver al carrito"><ArrowLeftIcon size={16} /></button>
          )}
          <h2 id="carrito-titulo">{paso === 'datos' && items.length > 0 ? 'Tus datos' : 'Tu carrito'}</h2>
          <button className="btn-icono" onClick={cerrar} aria-label="Cerrar carrito"><XIcon size={16} /></button>
        </div>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <ShoppingCartIcon size={32} />
            <p>Todavía no agregaste productos.</p>
            <button className="btn btn-gris" onClick={cerrar}>Ver productos</button>
          </div>
        ) : paso === 'datos' ? (
          <form className="carrito-form" onSubmit={pagar}>
            <div className="carrito-datos">
              <p className="nota">Los usamos para preparar y enviar tu compra.</p>
              {campos.map(({ nombre, etiqueta, ...atributos }) => (
                <label key={nombre}>{etiqueta}
                  <input {...atributos} name={nombre} value={comprador[nombre]} required
                    onChange={e => setComprador(c => ({ ...c, [nombre]: e.target.value }))} />
                </label>
              ))}
            </div>
            <div className="carrito-pie">
              <div className="carrito-total"><span>Total</span><strong>{pesos(total)}</strong></div>
              <button className="btn btn-azul" disabled={pagando}>
                {pagando ? 'Abriendo Mercado Pago' : 'Pagar con Mercado Pago'}
              </button>
              {error && <p className="error" role="alert">{error}</p>}
            </div>
          </form>
        ) : (
          <>
            <ul className="carrito-lista">
              {items.map(i => (
                <li key={i.id}>
                  <div className="carrito-foto"><Image src={i.foto} alt="" fill sizes="64px" /></div>
                  <div className="carrito-info">
                    <strong>{i.nombre}</strong>
                    <span>{pesos(i.precio)}</span>
                    <div className="cantidad">
                      <button onClick={() => cambiar(i.id, i.cantidad - 1)} disabled={i.cantidad <= 1} aria-label={`Restar uno de ${i.nombre}`}><MinusIcon size={14} /></button>
                      <span aria-live="polite">{i.cantidad}</span>
                      <button onClick={() => cambiar(i.id, i.cantidad + 1)} disabled={i.cantidad >= maximo} aria-label={`Sumar uno de ${i.nombre}`}><PlusIcon size={14} /></button>
                    </div>
                  </div>
                  <button className="btn-icono" onClick={() => quitar(i.id)} aria-label={`Quitar ${i.nombre}`}><TrashIcon size={16} /></button>
                </li>
              ))}
            </ul>

            <div className="carrito-pie">
              <div className="carrito-total"><span>Total</span><strong>{pesos(total)}</strong></div>
              <button className="btn btn-azul" onClick={() => { setError(''); setPaso('datos'); }}>Continuar</button>
              {error && <p className="error" role="alert">{error}</p>}
              <p className="nota">Pagás con tarjeta, débito o dinero en cuenta. Antes de enviarlo te confirmamos el stock por WhatsApp.</p>
            </div>
          </>
        )}
      </dialog>
    </Contexto.Provider>
  );
}

export const useCarrito = () => useContext(Contexto);

// Botón de la barra con la cantidad de productos
export function BotonCarrito() {
  const { unidades, abrir } = useCarrito();
  return (
    <button className="btn-icono boton-carrito" onClick={abrir} aria-label={`Carrito, ${unidades} ${unidades === 1 ? 'producto' : 'productos'}`}>
      <ShoppingCartIcon size={16} />
      {unidades > 0 && <span className="globo">{unidades}</span>}
    </button>
  );
}
