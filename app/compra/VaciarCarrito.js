'use client';

import { useEffect } from 'react';
import { useCarrito } from '../Carrito';

// Con el pago aprobado, el carrito se vacía
export default function VaciarCarrito() {
  const { vaciar } = useCarrito();
  useEffect(() => { vaciar(); }, []);
  return null;
}
