'use client';

import {
  CircuitryIcon, DesktopIcon, DesktopTowerIcon, GameControllerIcon, GraphicsCardIcon, HeadphonesIcon,
  KeyboardIcon, LightningIcon, MonitorIcon, MouseIcon, PackageIcon, StackIcon
} from '@phosphor-icons/react';

const iconos = {
  Mouse: MouseIcon, Teclados: KeyboardIcon, Auriculares: HeadphonesIcon, Monitores: MonitorIcon, Joysticks: GameControllerIcon,
  PCs: DesktopIcon, Combos: StackIcon, 'Placas de video': GraphicsCardIcon, Motherboards: CircuitryIcon,
  Fuentes: LightningIcon, Gabinetes: DesktopTowerIcon
};

// Muestra la foto del producto o, si no tiene, el ícono de su categoría
export function FotoProducto({ producto, tamaño = 48 }) {
  if (producto.imagen) return <img src={producto.imagen} alt={producto.nombre} loading="lazy" />;
  const Icono = iconos[producto.categoria] || PackageIcon;
  return <Icono size={tamaño} weight="light" aria-hidden="true" />;
}
