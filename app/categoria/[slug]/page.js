import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, PackageIcon, ShieldCheckIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { buscarCategoria, categorias } from '../../../lib/categorias';
import { listarPublicaciones } from '../../../lib/publicaciones';
import { consultar, garantia, whatsapp } from '../../../lib/contacto';
import Vidriera from '../../Vidriera';

// Se arma en cada visita para mostrar al instante lo que se sube desde /admin
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const c = buscarCategoria((await params).slug);
  return c ? { title: `${c.titulo} · Ultra Gaming`, description: `${c.titulo} con ${garantia} de garantía en Ultra Gaming.` } : {};
}

export default async function PaginaCategoria({ params }) {
  const categoria = buscarCategoria((await params).slug);
  if (!categoria) notFound();
  const publicaciones = await listarPublicaciones(categoria.slug);
  const otras = categorias.filter(c => c.slug !== categoria.slug);

  return (
    <>
      <nav className="nav arriba" aria-label="Principal">
        <Link href="/" className="logo" aria-label="Ultra Gaming, inicio">ULTRA<span>GAMING</span></Link>
        <div className="nav-links nav-links-fijos">
          <Link href="/#ofertas"><ArrowLeftIcon size={14} /> Todas las categorías</Link>
        </div>
        <div className="nav-acciones">
          <a href={whatsapp.link} className="btn-icono" target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsapp.texto}`}>
            <WhatsappLogoIcon size={16} />
          </a>
        </div>
      </nav>

      <main id="contenido">
        <section className="hero cabecera-categoria">
          <Image src={categoria.foto} alt="" fill priority sizes="100vw" className="hero-foto" />
          <div className="contenedor">
            <div className="hero-panel">
              <p className="etiqueta">Ofertas</p>
              <h1 className="degrade">{categoria.titulo}</h1>
              <p className="prueba" style={{ marginTop: 0 }}>
                <span><ShieldCheckIcon size={16} weight="fill" /> Garantía de {garantia} en todos los productos</span>
              </p>
            </div>
          </div>
        </section>

        <section className="seccion">
          <div className="contenedor">
            {publicaciones.length > 0 ? (
              <>
                <h2 className="titulo">Tocá una publicación para ver todo</h2>
                <p className="bajada">{publicaciones.length === 1 ? '1 publicación' : `${publicaciones.length} publicaciones`}</p>
                <Vidriera productos={publicaciones} />
              </>
            ) : (
              <div className="vacio">
                <PackageIcon size={32} />
                <h2>Todavía no hay publicaciones en {categoria.titulo}</h2>
                <p>Estamos cargando el stock. Mientras tanto, escribinos y te pasamos lo que tenemos.</p>
                <a href={consultar(`Hola, quiero consultar por ${categoria.titulo}.`)} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
                  <WhatsappLogoIcon size={16} weight="fill" /> Consultar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="seccion otras">
          <div className="contenedor">
            <h2 className="titulo">Otras categorías</h2>
            <div className="filtros">
              {otras.map(c => <Link key={c.slug} href={`/categoria/${c.slug}`} className="filtro">{c.titulo}</Link>)}
            </div>
          </div>
        </section>
      </main>

      <a href={whatsapp.link} className="wa-flotante" target="_blank" rel="noopener noreferrer" aria-label={`Escribinos por WhatsApp al ${whatsapp.texto}`}>
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
    </>
  );
}
