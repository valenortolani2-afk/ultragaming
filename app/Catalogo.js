'use client';

import { useState } from 'react';
import { CheckIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react';
import { pesos, useCarrito } from './carrito';
import { FotoProducto } from './FotoProducto';

export function TarjetaProducto({ producto: p }) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  return (
    <article className="producto">
      <div className="foto"><FotoProducto producto={p} /></div>
      <p className="marca">{p.marca}</p>
      <h3>{p.nombre}</h3>
      <div className="pie">
        <span className="precio">{pesos(p.precio)}</span>
        <button className="btn btn-principal btn-chico" aria-label={`Agregar ${p.nombre} al carrito`} onClick={() => {
          agregar(p.id);
          setAgregado(true);
          setTimeout(() => setAgregado(false), 1200);
        }}>
          {agregado ? <><CheckIcon size={16} /> Agregado</> : <><PlusIcon size={16} /> Agregar</>}
        </button>
      </div>
    </article>
  );
}

export function Vitrina() {
  const { productos } = useCarrito();
  return (
    <div className="vitrina">
      {productos.slice(0, 3).map(p => <TarjetaProducto key={p.id} producto={p} />)}
    </div>
  );
}

export default function Catalogo() {
  const { productos } = useCarrito();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))];
  const texto = busqueda.trim().toLowerCase();
  const lista = productos.filter(p =>
    (categoria === 'Todos' || p.categoria === categoria) &&
    (p.nombre + ' ' + p.marca).toLowerCase().includes(texto)
  );

  return (
    <>
      <div className="herramientas">
        <label className="buscador">
          <MagnifyingGlassIcon size={16} />
          <input type="search" placeholder="Buscar por producto o marca" aria-label="Buscar productos"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </label>
        <div className="filtros" role="group" aria-label="Categorías">
          {categorias.map(c => (
            <button key={c} className={'filtro' + (c === categoria ? ' activo' : '')} aria-pressed={c === categoria} onClick={() => setCategoria(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {lista.length > 0 ? (
        <div className="grilla">
          {lista.map(p => <TarjetaProducto key={p.id} producto={p} />)}
        </div>
      ) : (
        <div className="vacio">
          <MagnifyingGlassIcon size={32} />
          <h3>No encontramos “{busqueda}”</h3>
          <p>Probá con otra palabra o mirá todas las categorías.</p>
          <button className="btn btn-secundario btn-chico" onClick={() => { setBusqueda(''); setCategoria('Todos'); }}>Ver todos los productos</button>
        </div>
      )}
    </>
  );
}
