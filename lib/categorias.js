// Categorías de la vidriera. Cada tarjeta de la página principal lleva a /categoria/<slug>,
// donde se ven los productos que subiste desde /admin a esa categoría.
// titulo: lo que dice la tarjeta. nombre: lo que aparece en el panel y en cada publicación.
export const categorias = [
  { slug: 'pcs-outlet', nombre: 'PCs outlet', titulo: 'PCs outlet', foto: '/rubros/pcs-outlet.jpg' },
  { slug: 'combos', nombre: 'Combos', titulo: 'Combo actualización', foto: '/rubros/combos.webp' },
  { slug: 'placas-de-video', nombre: 'Placas de video', titulo: 'Placas de video GeForce RTX y Radeon RX', foto: '/rubros/placas-de-video.jpg' },
  { slug: 'motherboards', nombre: 'Motherboards', titulo: 'Motherboard', foto: '/rubros/motherboards.jpg' },
  { slug: 'fuentes', nombre: 'Fuentes', titulo: 'Fuentes nuevas y outlet', foto: '/rubros/fuentes.jpg' },
  { slug: 'gabinetes', nombre: 'Gabinetes', titulo: 'Gabinetes', foto: '/rubros/gabinetes.webp' },
  { slug: 'monitores', nombre: 'Monitores', titulo: 'Monitores', foto: '/rubros/monitores.jpg' }
];

export const buscarCategoria = slug => categorias.find(c => c.slug === slug);
