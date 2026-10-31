import Link from 'next/link';
import { ArrowLeftIcon, MagnifyingGlassIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { buscar } from '../../lib/buscar';
import { categorias as todas } from '../../lib/categorias';
import { consultar, whatsapp } from '../../lib/contacto';
import Vidriera from '../Vidriera';
import { BotonCarrito } from '../Carrito';
import Buscador from '../Buscador';

// Se arma en cada búsqueda con lo que está publicado en ese momento
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const q = ((await searchParams).q || '').trim();
  return { title: q ? `${q} · Buscar · Ultra Gaming` : 'Buscar · Ultra Gaming', robots: { index: false } };
}

export default async function PaginaBuscar({ searchParams }) {
  const q = String((await searchParams).q || '').trim().slice(0, 80);
  const { categorias, productos } = await buscar(q);

  return (
    <>
      <nav className="nav arriba" aria-label="Principal">
        <Link href="/" className="logo" aria-label="Ultra Gaming, inicio">ULTRA<span>GAMING</span></Link>
        <div className="nav-links nav-links-fijos">
          <Link href="/#ofertas" aria-label="Todas las categorías"><ArrowLeftIcon size={14} /> <span>Todas las categorías</span></Link>
        </div>
        <div className="nav-acciones">
          <Buscador />
          <a href={whatsapp.link} className="btn-icono" target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsapp.texto}`}>
            <WhatsappLogoIcon size={16} />
          </a>
          <BotonCarrito />
        </div>
      </nav>

      <main id="contenido">
        <section className="seccion pagina-buscar">
          <div className="contenedor">
            <form action="/buscar" role="search" className="buscador-form buscador-grande">
              <MagnifyingGlassIcon size={20} aria-hidden />
              <input type="search" name="q" defaultValue={q} placeholder="Buscar productos y categorías" aria-label="Buscar productos y categorías" maxLength={80} required />
              <button className="btn btn-azul btn-chico">Buscar</button>
            </form>

            {!q ? (
              <>
                <h1 className="titulo">¿Qué estás buscando?</h1>
                <p className="bajada">Escribí un modelo, una marca o lo que necesitás. También podés mirar por categoría:</p>
                <div className="filtros">
                  {todas.map(c => <Link key={c.slug} href={`/categoria/${c.slug}`} className="filtro">{c.titulo}</Link>)}
                </div>
              </>
            ) : (
              <>
                <h1 className="titulo">Resultados para “{q}”</h1>
                <p className="bajada">
                  {productos.length === 0 ? 'No encontramos productos publicados con esas palabras.'
                    : productos.length === 1 ? '1 producto. Tocalo para ver todo.' : `${productos.length} productos. Tocá uno para ver todo.`}
                </p>
                {categorias.length > 0 && (
                  <div className="filtros">
                    {categorias.map(c => <Link key={c.slug} href={`/categoria/${c.slug}`} className="filtro">Ver todo en {c.titulo}</Link>)}
                  </div>
                )}
                {productos.length > 0 ? <Vidriera productos={productos} /> : (
                  <div className="vacio">
                    <MagnifyingGlassIcon size={32} />
                    <h2>Puede que lo tengamos sin publicar</h2>
                    <p>Escribinos y te decimos si lo conseguimos.</p>
                    <a href={consultar(`Hola, ¿tienen ${q}?`)} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
                      <WhatsappLogoIcon size={16} weight="fill" /> Consultar por WhatsApp
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <a href={whatsapp.link} className="wa-flotante" target="_blank" rel="noopener noreferrer" aria-label={`Escribinos por WhatsApp al ${whatsapp.texto}`}>
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
    </>
  );
}
