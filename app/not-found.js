import { GameControllerIcon } from '@phosphor-icons/react/dist/ssr';

export const metadata = { title: 'Ultra Gaming · Página no encontrada' };

export default function NoEncontrada() {
  return (
    <main id="contenido" className="simple">
      <div>
        <GameControllerIcon size={64} weight="light" className="icono-grande" />
        <h1>Esta página no existe</h1>
        <p className="bajada">Puede que el link esté mal escrito o que el producto ya no esté publicado.</p>
        <a href="/" className="btn btn-principal">Volver a la tienda</a>
      </div>
    </main>
  );
}
