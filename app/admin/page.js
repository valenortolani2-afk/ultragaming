import Link from 'next/link';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';
import { categorias } from '../../lib/categorias';
import { blobConfigurado } from '../../lib/publicaciones';
import { garantia } from '../../lib/contacto';
import Panel from './Panel';

export const metadata = { title: 'Ultra Gaming · Panel de productos', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function Admin() {
  const faltan = [
    !blobConfigurado() && 'BLOB_READ_WRITE_TOKEN (se crea al conectar un Blob store en Vercel)',
    !process.env.ADMIN_PASSWORD && 'ADMIN_PASSWORD (la contraseña de este panel)'
  ].filter(Boolean);

  return (
    <main id="contenido" className="admin contenedor">
      <Link href="/" className="volver"><ArrowLeftIcon size={16} /> Volver a la página</Link>
      <h1 className="titulo">Panel de productos</h1>
      <p className="bajada">Elegí la categoría, subí las fotos y cargá precio, descripción y garantía. El producto aparece al instante en la vidriera.</p>
      {faltan.length === 0 ? <Panel categorias={categorias} garantiaBase={garantia} /> : (
        <div className="aviso">
          <h2>Falta configurar el panel</h2>
          <p>En Vercel, en tu proyecto, faltan estas variables:</p>
          <ul>{faltan.map(f => <li key={f}>{f}</li>)}</ul>
          <p>Configurá las variables indicadas en Vercel y volvé a desplegar el proyecto. Encontrás los pasos en el archivo LEEME.md, en la raíz del código.</p>
        </div>
      )}
    </main>
  );
}
