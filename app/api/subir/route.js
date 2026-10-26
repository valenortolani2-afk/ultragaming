import { handleUpload } from '@vercel/blob/client';
import { blobConfigurado, claveValida } from '../../../lib/publicaciones';
import { buscarCategoria } from '../../../lib/categorias';

// Entrega al panel /admin un permiso temporal para subir una foto directo a Vercel Blob
export async function POST(request) {
  if (!blobConfigurado()) return Response.json({ error: 'Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN)' }, { status: 500 });
  try {
    const respuesta = await handleUpload({
      body: await request.json(),
      request,
      onBeforeGenerateToken: async (pathname, clave) => {
        const [carpeta, categoria] = pathname.split('/');
        if (!claveValida(clave)) throw new Error('Contraseña incorrecta');
        if (carpeta !== 'fotos' || !buscarCategoria(categoria)) throw new Error('Categoría inválida');
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true
        };
      }
    });
    return Response.json(respuesta);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
