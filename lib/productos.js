// Productos de la vidriera. Cada uno se abre al tocar su foto.
// IMPORTANTE: los precios son de ejemplo. Reemplazalos por los reales antes de publicar.
// fotos: rutas dentro de /public. desde: true muestra "Desde $..." (para rubros con varios modelos).
export const productos = [
  {
    id: 'pc-gamer-ryzen-zotac',
    nombre: 'PC gamer Ryzen con GeForce Zotac',
    categoria: 'PCs outlet',
    precio: 1250000,
    fotos: ['/rubros/pcs-outlet.jpg'],
    descripcion: 'PC armada y probada, lista para jugar. Gabinete blanco con vidrio templado e iluminación ARGB.',
    detalles: ['Procesador AMD Ryzen', 'Placa de video Zotac Gaming GeForce', 'Memoria DDR4 en dual channel', '6 ventiladores ARGB']
  },
  {
    id: 'combo-b650m-ryzen-5',
    nombre: 'Combo ASUS TUF B650M Plus WiFi + Ryzen 5 + cooler',
    categoria: 'Combos',
    precio: 890000,
    fotos: ['/rubros/combos.webp'],
    descripcion: 'Combo de actualización probado y compatible: motherboard, procesador y cooler listos para instalar.',
    detalles: ['Motherboard ASUS TUF Gaming B650M Plus WiFi', 'Procesador AMD Ryzen 5 serie 9000', 'Cooler torre con ventilador ARGB']
  },
  {
    id: 'placas-de-video',
    nombre: 'Placas de video GeForce RTX y Radeon RX',
    categoria: 'Placas de video',
    precio: 420000,
    desde: true,
    fotos: ['/rubros/placas-de-video.jpg'],
    descripcion: 'Stock de placas MSI, ASUS, Zotac y más. Consultanos qué modelo te conviene según tu fuente y tu monitor.',
    detalles: ['GeForce RTX serie 3000 y superiores', 'Radeon RX 6600, 6700 XT y otras', 'Marcas MSI, ASUS, Zotac, XFX y Sapphire']
  },
  {
    id: 'asus-rog-strix-b850-a',
    nombre: 'Motherboard ASUS ROG Strix B850 A Gaming WiFi',
    categoria: 'Motherboards',
    precio: 389000,
    fotos: ['/rubros/motherboards.jpg'],
    descripcion: 'Motherboard blanca para AMD Ryzen serie 9000, con WiFi 7 y antena incluida.',
    detalles: ['Socket AM5', 'Memoria DDR5', 'WiFi y Bluetooth', 'Diseño blanco ROG Strix']
  },
  {
    id: 'asus-rog-strix-850w',
    nombre: 'Fuente ASUS ROG Strix 850W Aura Edition',
    categoria: 'Fuentes',
    precio: 279000,
    fotos: ['/rubros/fuentes.jpg'],
    descripcion: 'Fuente modular de 850 W con certificación 80 Plus Gold e iluminación Aura Sync.',
    detalles: ['850 W', '80 Plus Gold', 'Compatible ATX 3.0', 'Iluminación RGB Aura']
  },
  {
    id: 'asus-rog-strix-helios',
    nombre: 'Gabinete ASUS ROG Strix Helios',
    categoria: 'Gabinetes',
    precio: 459000,
    fotos: ['/rubros/gabinetes.webp'],
    descripcion: 'Gabinete mid tower con paneles de vidrio templado y frente iluminado ROG.',
    detalles: ['Vidrio templado', 'Frente con iluminación Aura', 'Gran espacio para placas largas']
  },
  {
    id: 'monitor-curvo-ultrawide',
    nombre: 'Monitor gamer curvo super ultrawide',
    categoria: 'Monitores',
    precio: 899000,
    fotos: ['/rubros/monitores.jpg'],
    descripcion: 'Pantalla curva extra ancha para juegos de simulación, carreras y trabajo con varias ventanas.',
    detalles: ['Formato super ultrawide 32:9', 'Pantalla curva', 'Ideal para simuladores y multitarea']
  }
];
