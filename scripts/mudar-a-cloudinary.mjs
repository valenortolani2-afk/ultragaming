// Copia a Cloudinary las fotos de productos y los banners que están en Vercel Blob,
// y cambia las direcciones de las fotos en cada publicaciones/<categoria>/<id>.json.
// Se puede correr más de una vez: lo que ya está en Cloudinary se saltea.
// Las fotos viejas quedan en Blob como respaldo; se pueden borrar a mano cuando todo esté bien.
//
//   node --env-file=.env scripts/mudar-a-cloudinary.mjs

import { list, put } from '@vercel/blob';
import { cloudinaryConfigurado, esDeCloudinary, listarEtiqueta, subirDesdeUrl } from '../lib/cloudinary.js';

if (!process.env.BLOB_READ_WRITE_TOKEN || !cloudinaryConfigurado()) {
  console.error('Faltan BLOB_READ_WRITE_TOKEN o las variables CLOUDINARY_* en el .env');
  process.exit(1);
}

const esDeBlob = url => url.includes('.public.blob.vercel-storage.com/');
// nombre del archivo sin extensión: banners/oferta-AbC123.jpg → oferta-AbC123
const nombreDe = url => decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/\.[a-z0-9]+$/i, '');

// Hace las tareas de a varias por vez
async function deA(cantidad, lista, tarea) {
  const cola = [...lista];
  await Promise.all(Array.from({ length: cantidad }, async () => {
    while (cola.length) await tarea(cola.shift());
  }));
}

async function listarTodo(prefix) {
  const blobs = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor });
    blobs.push(...r.blobs);
    cursor = r.cursor;
  } while (cursor);
  return blobs;
}

let fotosMudadas = 0, errores = 0;

const publicaciones = (await listarTodo('publicaciones/')).filter(b => b.pathname.endsWith('.json'));
console.log(`${publicaciones.length} productos`);
await deA(4, publicaciones, async b => {
  try {
    const r = await fetch(`${b.url}?v=${+new Date(b.uploadedAt)}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`no se pudo leer (${r.status})`);
    const p = await r.json();
    if (!p.fotos?.some(esDeBlob)) return;
    const fotos = [];
    for (const f of p.fotos) {
      fotos.push(esDeBlob(f) ? await subirDesdeUrl(f, `fotos/${p.slug}`) : f);
      if (esDeBlob(f)) fotosMudadas++;
    }
    await put(b.pathname, JSON.stringify({ ...p, fotos }), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true
    });
    console.log(`✓ ${p.nombre} (${fotos.length} fotos)`);
  } catch (err) {
    errores++;
    console.error(`✗ ${b.pathname}: ${err.message}`);
  }
});

const yaSubidos = new Set((await listarEtiqueta('banner')).filter(x => esDeCloudinary(x.url)).map(x => nombreDe(x.url)));
const banners = (await listarTodo('banners/')).filter(b => /\.(jpe?g|png|webp|avif)$/i.test(b.pathname));
// Del más viejo al más nuevo, así en Cloudinary quedan en el mismo orden
banners.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
for (const b of banners) {
  const nombre = nombreDe(b.url);
  if (yaSubidos.has(nombre)) continue;
  try {
    await subirDesdeUrl(b.url, 'banners', 'banner', { public_id: nombre });
    console.log(`✓ banner ${nombre}`);
  } catch (err) {
    errores++;
    console.error(`✗ banner ${nombre}: ${err.message}`);
  }
}

console.log(`\nListo: ${fotosMudadas} fotos y ${banners.length - yaSubidos.size} banners pasados a Cloudinary. Errores: ${errores}.`);
if (errores) process.exitCode = 1;
