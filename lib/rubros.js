// Rubros del local. Cada uno tiene su página en /rubros/<slug> con las publicaciones subidas a Vercel Blob.
// Para cambiar la foto de un rubro, guardala en public/rubros/ y cambiá foto.
// encuadre elige qué parte de la foto queda visible (como object-position de CSS).
export const rubros = [
  { slug: 'pcs-outlet', titulo: 'PCs outlet', texto: 'Computadoras armadas a precio outlet, listas para usar.', foto: '/rubros/pcs-outlet.jpg', encuadre: 'center 40%' },
  { slug: 'combos', titulo: 'Combos de actualización', texto: 'Procesador, motherboard y memoria que funcionan juntos.', foto: '/rubros/combos.webp', encuadre: 'center 30%' },
  { slug: 'placas-de-video', titulo: 'Placas de video', texto: 'Para jugar, editar o hacer streaming.', foto: '/rubros/placas-de-video.jpg', encuadre: 'center 25%' },
  { slug: 'motherboards', titulo: 'Motherboards', texto: 'Para Intel y AMD, de entrada y de alta gama.', foto: '/rubros/motherboards.jpg', encuadre: 'center 35%' },
  { slug: 'fuentes', titulo: 'Fuentes', texto: 'Certificadas, con la potencia justa para tu equipo.', foto: '/rubros/fuentes.jpg', encuadre: 'center 30%' },
  { slug: 'gabinetes', titulo: 'Gabinetes', texto: 'Con buena ventilación y espacio para crecer.', foto: '/rubros/gabinetes.webp', encuadre: 'center 25%' },
  { slug: 'monitores', titulo: 'Monitores', texto: 'De oficina y gamer, con alta tasa de refresco.', foto: '/rubros/monitores.jpg', encuadre: 'center 35%' }
];

export const buscarRubro = slug => rubros.find(r => r.slug === slug);
