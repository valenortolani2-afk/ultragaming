// Categorías de la vidriera. El panel /admin sube productos a una de estas.
export const categorias = [
  { slug: 'pcs-outlet', nombre: 'PCs outlet' },
  { slug: 'combos', nombre: 'Combos' },
  { slug: 'placas-de-video', nombre: 'Placas de video' },
  { slug: 'motherboards', nombre: 'Motherboards' },
  { slug: 'fuentes', nombre: 'Fuentes' },
  { slug: 'gabinetes', nombre: 'Gabinetes' },
  { slug: 'monitores', nombre: 'Monitores' }
];

export const buscarCategoria = slug => categorias.find(c => c.slug === slug);
