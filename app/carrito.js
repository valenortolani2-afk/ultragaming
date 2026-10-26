'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, XIcon } from '@phosphor-icons/react';
import { FotoProducto } from './FotoProducto';

import { pesos } from '../lib/formato';
export { pesos };

const Contexto = createContext(null);
export const useCarrito = () => useContext(Contexto);

// Guarda el carrito en el navegador y lo comparte entre la barra, el catálogo y el panel
export function CarritoProvider({ productos, children }) {
  const [carrito, setCarrito] = useState({});
  const [cargado, setCargado] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try { setCarrito(JSON.parse(localStorage.getItem('carrito')) || {}); } catch {}
    setCargado(true);
  }, []);
  useEffect(() => {
    if (!cargado) return;
    try { localStorage.setItem('carrito', JSON.stringify(carrito)); } catch {}
  }, [carrito, cargado]);

  // Solo cuenta productos que siguen en el catálogo
  const items = useMemo(() => Object.entries(carrito)
    .map(([id, cantidad]) => ({ producto: productos.find(p => p.id === id), cantidad }))
    .filter(i => i.producto), [carrito, productos]);

  const valor = {
    productos, items, abierto, setAbierto,
    unidades: items.reduce((s, i) => s + i.cantidad, 0),
    total: items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0),
    agregar(id, cant = 1) {
      setCarrito(c => {
        const nuevo = { ...c, [id]: (c[id] || 0) + cant };
        if (nuevo[id] <= 0) delete nuevo[id];
        return nuevo;
      });
    }
  };

  return (
    <Contexto.Provider value={valor}>
      {children}
      <PanelCarrito />
    </Contexto.Provider>
  );
}

function PanelCarrito() {
  const { items, total, abierto, setAbierto, agregar } = useCarrito();
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    const cerrarConEsc = e => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', cerrarConEsc);
    return () => window.removeEventListener('keydown', cerrarConEsc);
  }, [abierto, setAbierto]);

  // Pago: el servidor arma el cobro en Mercado Pago y nos devuelve el link de pago
  async function pagar() {
    setPagando(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ id: i.producto.id, cantidad: i.cantidad })) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos iniciar el pago. Probá de nuevo en unos minutos.');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setPagando(false);
    }
  }

  return (
    <>
      <div className={'fondo-oscuro' + (abierto ? ' abierto' : '')} onClick={() => setAbierto(false)} />
      <aside className={'panel' + (abierto ? ' abierto' : '')} aria-label="Carrito" aria-hidden={!abierto} inert={!abierto}>
        <div className="panel-cabeza">
          <h2>Tu carrito</h2>
          <button className="btn-icono" aria-label="Cerrar carrito" onClick={() => setAbierto(false)}><XIcon size={16} /></button>
        </div>

        {items.length === 0 ? (
          <div className="vacio">
            <ShoppingCartIcon size={32} />
            <h3>Tu carrito está vacío</h3>
            <p>Agregá productos desde el catálogo y pagalos todos juntos en cuotas.</p>
            <a href="#catalogo" className="btn btn-secundario btn-chico" onClick={() => setAbierto(false)}>Ver el catálogo</a>
          </div>
        ) : (
          <ul className="panel-items">
            {items.map(({ producto: p, cantidad }) => (
              <li key={p.id}>
                <div className="mini"><FotoProducto producto={p} tamaño={24} /></div>
                <div className="info"><h4>{p.nombre}</h4><span>{pesos(p.precio)}</span></div>
                <div className="cantidad">
                  <button className="btn-icono" aria-label={`Quitar un ${p.nombre}`} onClick={() => agregar(p.id, -1)}><MinusIcon size={14} /></button>
                  <b>{cantidad}</b>
                  <button className="btn-icono" aria-label={`Agregar otro ${p.nombre}`} onClick={() => agregar(p.id, 1)}><PlusIcon size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="panel-pie">
          <div className="total"><span>Total</span><b>{pesos(total)}</b></div>
          <button className="btn btn-mp" disabled={items.length === 0 || pagando} onClick={pagar}>
            {pagando ? 'Conectando con Mercado Pago' : 'Pagar con Mercado Pago'}
          </button>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="nota">Elegís las cuotas en el paso siguiente, dentro de Mercado Pago.</p>
        </div>
      </aside>
    </>
  );
}
