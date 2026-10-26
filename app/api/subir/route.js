import { handleUpload } from '@vercel/blob/client';
import { blobConfigurado, claveValida } from '../../../lib/publicaciones';
import { buscarRubro } from '../../../lib/rubros';

// Entrega al panel de /admin un permiso temporal para subir una foto directo a Vercel Blob
export async function POST(request) {
  if (!blobConfigurado()) return Response.json({ error: 'Falta configurar BLOB_READ_WRITE_TOKEN' }, { status: 500 });
  const body = await request.json();
  try {
    const respuesta = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clave) => {
        const [carpeta, rubro] = pathname.split('/');
        if (!claveValida(clave)) throw new Error('Contraseña incorrecta');
        if (carpeta !== 'fotos' || !buscarRubro(rubro)) throw new Error('Rubro inválido');
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
