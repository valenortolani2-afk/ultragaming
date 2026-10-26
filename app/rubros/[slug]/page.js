import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PackageIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { buscarRubro, rubros } from '../../../lib/rubros';
import { listarPublicaciones } from '../../../lib/publicaciones';
import { consultar, whatsapp } from '../../../lib/contacto';
import { pesos } from '../../../lib/formato';
import Encabezado from '../../Encabezado';
import Pie from '../../Pie';

// Siempre muestra las publicaciones más recientes
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const rubro = buscarRubro((await params).slug);
  if (!rubro) return {};
  return { title: `${rubro.titulo} · Ultra Gaming`, description: rubro.texto };
}

export default async function PaginaRubro({ params }) {
  const rubro = buscarRubro((await params).slug);
  if (!rubro) notFound();
  const publicaciones = await listarPublicaciones(rubro.slug);
  const otros = rubros.filter(r => r.slug !== rubro.slug);

  return (
    <>
      <Encabezado />
      <main id="contenido">
        <section className="rubro-cabecera">
          <Image src={rubro.foto} alt="" fill priority sizes="100vw" className="hero-foto" style={{ objectPosition: rubro.encuadre }} />
          <div className="contenedor">
            <div className="hero-texto">
              <p className="etiqueta">Qué vendemos</p>
              <h1>{rubro.titulo}</h1>
              <p className="bajada">{rubro.texto}</p>
            </div>
          </div>
        </section>

        <section className="seccion">
          <div className="contenedor">
            {publicaciones.length > 0 ? (
              <>
                <p className="contador">{publicaciones.length === 1 ? '1 publicación' : `${publicaciones.length} publicaciones`}</p>
                <div className="grilla">
                  {publicaciones.map(p => <Publicacion key={p.id} p={p} rubro={rubro} />)}
                </div>
              </>
            ) : (
              <div className="vacio">
                <PackageIcon size={32} />
                <h3>Todavía no hay publicaciones en {rubro.titulo}</h3>
                <p>Estamos cargando el stock. Mientras tanto, consultanos por WhatsApp y te pasamos lo que tenemos.</p>
                <a href={consultar(`Hola, quiero consultar por ${rubro.titulo}.`)} className="btn btn-principal btn-chico" target="_blank" rel="noopener noreferrer">
                  <WhatsappLogoIcon size={16} /> Consultar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="seccion otros-rubros">
          <div className="contenedor">
            <h2 className="titulo-seccion">Otros rubros</h2>
            <div className="chips">
              {otros.map(r => <Link key={r.slug} href={`/rubros/${r.slug}`} className="filtro">{r.titulo}</Link>)}
            </div>
          </div>
        </section>
      </main>
      <a href={whatsapp.link} className="wa-flotante" target="_blank" rel="noopener noreferrer" aria-label={`Escribinos por WhatsApp al ${whatsapp.texto}`}>
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
      <Pie />
    </>
  );
}

function Publicacion({ p, rubro }) {
  return (
    <article className="producto publicacion">
      <div className="fotos">
        {p.fotos.map((f, i) => (
          <div key={f} className="foto">
            <Image src={f} alt={`${p.titulo}, foto ${i + 1}`} fill sizes="(max-width: 720px) 100vw, 400px" />
          </div>
        ))}
      </div>
      {p.fotos.length > 1 && <p className="marca">{p.fotos.length} fotos · deslizá para verlas</p>}
      <h3>{p.titulo}</h3>
      {p.descripcion && <p className="descripcion">{p.descripcion}</p>}
      <div className="pie">
        <span className="precio">{p.precio ? pesos(p.precio) : 'Consultar precio'}</span>
        <a href={consultar(`Hola, quiero consultar por "${p.titulo}" (${rubro.titulo}).`)} className="btn btn-principal btn-chico" target="_blank" rel="noopener noreferrer">
          <WhatsappLogoIcon size={16} /> Consultar
        </a>
      </div>
    </article>
  );
}
