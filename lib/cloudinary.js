import { createHash } from 'crypto';

// Las fotos de los productos y los banners se guardan en Cloudinary, que además las entrega
// achicadas y en el mejor formato para cada navegador (ver lib/cargador-imagenes.js).
// El panel las sube directo desde el navegador con una firma que da /api/subir.

const nube = () => process.env.CLOUDINARY_CLOUD_NAME;
export const cloudinaryConfigurado = () => Boolean(nube() && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

// Firma de Cloudinary: los parámetros ordenados como a=1&b=2, seguidos del secreto, en SHA-1
function firmar(parametros) {
  const texto = Object.keys(parametros).sort().map(k => `${k}=${parametros[k]}`).join('&');
  return createHash('sha1').update(texto + process.env.CLOUDINARY_API_SECRET).digest('hex');
}

// Permiso para que el panel suba una imagen a la carpeta indicada. Los banners llevan la etiqueta "banner" para listarlos.
export function permisoDeSubida(carpeta, etiqueta, extra = {}) {
  const parametros = {
    allowed_formats: 'jpg,png,webp,avif',
    folder: `ultragaming/${carpeta}`,
    timestamp: Math.floor(Date.now() / 1000),
    ...(etiqueta && { tags: etiqueta }),
    ...extra
  };
  return {
    url: `https://api.cloudinary.com/v1_1/${nube()}/image/upload`,
    campos: { ...parametros, api_key: process.env.CLOUDINARY_API_KEY, signature: firmar(parametros) }
  };
}

// Sube una imagen desde el servidor (la usa la mudanza desde Blob, scripts/mudar-a-cloudinary.mjs)
export async function subirDesdeUrl(urlOrigen, carpeta, etiqueta, extra) {
  const { url, campos } = permisoDeSubida(carpeta, etiqueta, extra);
  const form = new FormData();
  for (const [k, v] of Object.entries({ ...campos, file: urlOrigen })) form.append(k, v);
  const r = await fetch(url, { method: 'POST', body: form });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || 'No se pudo subir a Cloudinary');
  return data.secure_url;
}

// Solo se aceptan imágenes de la propia cuenta de Cloudinary
export const esDeCloudinary = url => {
  try {
    const u = new URL(url);
    return u.hostname === 'res.cloudinary.com' && u.pathname.startsWith(`/${nube()}/image/upload/`);
  } catch { return false; }
};

// .../image/upload/v1712345/ultragaming/fotos/x.jpg → ultragaming/fotos/x
const idDe = url => new URL(url).pathname.split('/image/upload/')[1].replace(/^v\d+\//, '').replace(/\.[a-z0-9]+$/i, '');

export async function borrarDeCloudinary(urls) {
  await Promise.all(urls.filter(esDeCloudinary).map(async url => {
    const parametros = { public_id: idDe(url), timestamp: Math.floor(Date.now() / 1000) };
    const form = new FormData();
    for (const [k, v] of Object.entries({ ...parametros, api_key: process.env.CLOUDINARY_API_KEY, signature: firmar(parametros) })) form.append(k, v);
    await fetch(`https://api.cloudinary.com/v1_1/${nube()}/image/destroy`, { method: 'POST', body: form });
  }));
}

// Imágenes con una etiqueta, de la más nueva a la más vieja
export async function listarEtiqueta(etiqueta) {
  const auth = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${nube()}/resources/image/tags/${etiqueta}?max_results=100`, {
    headers: { Authorization: `Basic ${auth}` }, cache: 'no-store'
  });
  if (!r.ok) throw new Error(`Cloudinary respondió ${r.status}`);
  const { resources } = await r.json();
  return resources
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(i => ({ url: i.secure_url, fecha: new Date(i.created_at).toISOString() }));
}
