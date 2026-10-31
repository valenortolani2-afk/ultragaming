import { buscar } from '../../../lib/buscar';

// Resultados rápidos para el buscador de la barra: hasta 8 productos con lo justo para mostrarlos
export async function GET(request) {
  const q = (new URL(request.url).searchParams.get('q') || '').slice(0, 80);
  const { categorias, productos } = await buscar(q);
  return Response.json({
    categorias: categorias.map(({ slug, titulo }) => ({ slug, titulo })),
    productos: productos.slice(0, 8).map(p => ({
      id: p.id, slug: p.slug, nombre: p.nombre, categoria: p.categoria, precio: p.precio, desde: p.desde, foto: p.fotos[0]
    })),
    total: productos.length
  });
}
