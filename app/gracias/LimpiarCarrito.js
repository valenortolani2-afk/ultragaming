'use client';

import { useEffect } from 'react';

// Vacía el carrito cuando el pago fue aprobado
export default function LimpiarCarrito() {
  useEffect(() => {
    try { localStorage.removeItem('carrito'); } catch {}
  }, []);
  return null;
}
