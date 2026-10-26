import { rubros } from '../../lib/rubros';
import { blobConfigurado } from '../../lib/publicaciones';
import Encabezado from '../Encabezado';
import Panel from './Panel';

export const metadata = { title: 'Ultra Gaming · Panel de publicaciones', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function Admin() {
  return (
    <>
      <Encabezado />
      <main id="contenido" className="admin contenedor">
        <h1 className="titulo-seccion">Panel de publicaciones</h1>
        <p className="bajada">Subí fotos, título y precio. La publicación aparece al instante en la página de su rubro.</p>
        {blobConfigurado() && process.env.ADMIN_PASSWORD
          ? <Panel rubros={rubros.map(({ slug, titulo }) => ({ slug, titulo }))} />
          : <p className="error">Falta configurar BLOB_READ_WRITE_TOKEN y ADMIN_PASSWORD en el archivo .env (mirá LEEME.md).</p>}
      </main>
    </>
  );
}
