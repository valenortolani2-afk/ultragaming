import {
  ArrowCounterClockwiseIcon, ArrowRightIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, SealCheckIcon,
  ShieldCheckIcon, StackIcon, TruckIcon, WhatsappLogoIcon, WrenchIcon
} from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';
import { leerProductos } from '../lib/productos';
import { rubros } from '../lib/rubros';
import { consultar, listar, marcas, memorias, whatsapp } from '../lib/contacto';
import { CarritoProvider } from './carrito';
import Nav from './Nav';
import Catalogo, { Vitrina } from './Catalogo';
import { FraseReveladora, Revelar } from './Revelar';
import Pie from './Pie';

// Se vuelve a leer productos.json en cada visita, así los cambios del importador se ven al instante
export const dynamic = 'force-dynamic';

const beneficios = [
  { icono: CreditCardIcon, titulo: 'Cuotas con Mercado Pago', texto: 'Pagás con tarjeta, débito o dinero en cuenta, en las cuotas que ofrezca tu banco.' },
  { icono: TruckIcon, titulo: 'Envío a todo el país', texto: 'Despachamos tu pedido y te pasamos el número de seguimiento.' },
  { icono: ShieldCheckIcon, titulo: 'Garantía en cada producto', texto: 'Si algo falla dentro de la garantía, te lo resolvemos.' },
  { icono: ArrowCounterClockwiseIcon, titulo: '10 días para arrepentirte', texto: 'Si no te convence, lo devolvés dentro de los 10 días de recibirlo.' }
];

const pasos = [
  { titulo: 'Elegí tus productos', texto: 'Buscá por categoría o marca y sumá todo lo que quieras al carrito.' },
  { titulo: 'Pagá con Mercado Pago', texto: 'Elegís el medio de pago y las cuotas en la pantalla segura de Mercado Pago.' },
  { titulo: 'Recibilo en tu casa', texto: 'Te avisamos cuando sale el paquete y te pasamos el seguimiento.' }
];

const preguntas = [
  ['¿Hacen envíos a todo el país?', 'Sí. Enviamos a todas las provincias. El costo y el tiempo dependen de tu código postal y te los confirmamos al coordinar el envío.'],
  ['¿Cuánto tarda en llegar mi pedido?', 'Lo despachamos dentro de las 48 horas hábiles después de acreditado el pago. Según la zona, llega entre 3 y 7 días hábiles.'],
  ['¿Puedo pagar en cuotas?', 'Sí. Al pagar con Mercado Pago ves todas las cuotas disponibles para tu tarjeta antes de confirmar.'],
  ['¿Qué medios de pago aceptan?', 'Tarjetas de crédito y débito, dinero en cuenta de Mercado Pago y efectivo en puntos de pago habilitados.'],
  ['¿Los productos tienen garantía?', 'Sí. Todos tienen garantía. El plazo depende del producto y la marca, y lo ves en la factura.'],
  ['¿Puedo devolver un producto?', 'Sí. Tenés 10 días corridos desde que lo recibís para arrepentirte de la compra, como indica la ley. Usá el botón de arrepentimiento al pie de la página.'],
  ['¿Cómo sigo mi pedido?', 'Cuando despachamos el paquete te mandamos el número de seguimiento del correo.'],
  ['¿Entregan factura?', 'Sí. Cada compra lleva su factura, que también te sirve para hacer valer la garantía.'],
  ['¿Hacen servicio técnico?', `Sí. Reparamos, limpiamos y actualizamos computadoras. Escribinos por WhatsApp al ${whatsapp.texto} y te pasamos un presupuesto.`],
  ['¿Me ayudan a elegir los componentes?', 'Sí. Te asesoramos por WhatsApp para que la placa de video, la fuente, el gabinete y el resto sean compatibles con lo que ya tenés.']
];

export default function Inicio() {
  return (
    <CarritoProvider productos={leerProductos()}>
      <Nav />
      <main id="contenido">
        <section className="hero">
          <Image src="/local-ultra-gaming.jpg" alt="Frente del local de Ultra Gaming con el cartel del pulpo" fill priority sizes="100vw" className="hero-foto" />
          <div className="contenedor">
            <div className="hero-texto">
              <p className="etiqueta">Tienda informática</p>
              <h1>Armá tu setup gamer{" "}<br />sin pagar todo junto</h1>
              <p className="bajada">PCs outlet, combos de actualización, placas de video, componentes y monitores. Pagás en cuotas con Mercado Pago y te lo enviamos a todo el país.</p>
              <div className="hero-acciones">
                <a href="#catalogo" className="btn btn-principal"><PlusIcon size={16} /> Elegir mi equipo</a>
              </div>
              <div className="prueba">
                <span><ShieldCheckIcon size={16} /> Pago protegido por Mercado Pago</span>
                <span><ArrowCounterClockwiseIcon size={16} /> 10 días para arrepentirte</span>
                <span><SealCheckIcon size={16} /> Vendemos MSI, ASUS, Redragon y más marcas</span>
              </div>
            </div>
          </div>
        </section>

        <section className="destacados" aria-label="Productos destacados">
          <div className="contenedor">
            <Vitrina />
          </div>
        </section>

        <section className="marcas" aria-label="Marcas que vendemos">
          <div className="contenedor">
            <p className="marcas-titulo">Vendemos las marcas</p>
            <ul>
              {marcas.map(m => <li key={m}>{m}</li>)}
              {memorias.map(m => <li key={m} className="memoria">Memorias {m}</li>)}
            </ul>
          </div>
        </section>

        <Revelar id="rubros" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Qué vendemos</p>
            <h2 className="titulo-seccion">Todo para armar o mejorar tu PC</h2>
            <p className="bajada">Entrá a cada rubro para ver lo que tenemos publicado. Si no encontrás lo que buscás, consultanos por WhatsApp.</p>
            <div className="rubros">
              {rubros.map(({ slug, titulo, texto, foto, encuadre }) => (
                <Link key={slug} className="rubro con-foto" href={`/rubros/${slug}`}>
                  <Image src={foto} alt="" fill sizes="(max-width: 720px) 100vw, 400px" className="rubro-foto" style={{ objectPosition: encuadre }} />
                  <div className="rubro-contenido">
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                    <span className="consultar">Ver publicaciones <ArrowRightIcon size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Revelar>

        <Revelar id="servicio-tecnico" className="seccion">
          <div className="contenedor servicio">
            <div>
              <p className="etiqueta">Servicio técnico</p>
              <h2 className="titulo-seccion">Tu PC en manos de quienes la conocen</h2>
              <p className="bajada">Reparación, limpieza, actualización y asesoramiento personalizado en computación. También compramos y vendemos insumos de informática.</p>
              <a href={consultar('Hola, quiero consultar por servicio técnico.')} className="btn btn-principal" target="_blank" rel="noopener noreferrer">
                <WhatsappLogoIcon size={16} /> Pedir presupuesto por WhatsApp
              </a>
            </div>
            <ul>
              <li><WrenchIcon size={20} /><span><strong>Reparación y limpieza.</strong> Diagnóstico, cambio de piezas, pasta térmica y mantenimiento.</span></li>
              <li><StackIcon size={20} /><span><strong>Actualizaciones.</strong> Te armamos el combo justo y lo instalamos.</span></li>
              <li><SealCheckIcon size={20} /><span><strong>Marcas que vendemos.</strong> {listar(marcas)}. Memorias {listar(memorias)}.</span></li>
            </ul>
          </div>
        </Revelar>

        <Revelar className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Por qué comprar acá</p>
            <h2 className="titulo-seccion">Lo que necesitás para comprar tranquilo</h2>
            <p className="bajada">Precios claros, cuotas y un equipo que responde si algo sale mal.</p>
            <div className="beneficios">
              {beneficios.map(({ icono: Icono, titulo, texto }) => (
                <div key={titulo} className="beneficio">
                  <Icono size={32} weight="light" />
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </Revelar>

        <section className="frase" aria-label="Nuestra propuesta">
          <div className="contenedor">
            <FraseReveladora lineas={['Elegís el equipo.', 'Lo pagás en cuotas.', 'Nosotros lo llevamos a tu casa.']} />
          </div>
        </section>

        <Revelar id="catalogo" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Catálogo</p>
            <h2 className="titulo-seccion">Elegí tu próximo equipo</h2>
            <p className="bajada">Todos los precios son finales. Las cuotas las elegís al pagar.</p>
            <Catalogo />
          </div>
        </Revelar>

        <Revelar id="como-comprar" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Cómo comprar</p>
            <h2 className="titulo-seccion">Tres pasos y lo tenés en casa</h2>
            <p className="bajada">No necesitás crear una cuenta en la tienda.</p>
            <div className="pasos">
              {pasos.map((p, i) => (
                <div key={p.titulo} className="paso">
                  <b>{i + 1}</b>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </Revelar>

        <Revelar className="seccion">
          <div className="contenedor garantia">
            <div>
              <p className="etiqueta">Compra protegida</p>
              <h2 className="titulo-seccion">Si algo no está bien, lo resolvemos</h2>
              <p className="bajada" style={{ marginBottom: 0 }}>Comprar online tiene que ser tan seguro como en un local.</p>
            </div>
            <ul>
              <li><CheckCircleIcon size={20} weight="fill" /><span><strong>Pago con Mercado Pago.</strong> Nunca vemos ni guardamos los datos de tu tarjeta.</span></li>
              <li><CheckCircleIcon size={20} weight="fill" /><span><strong>10 días para arrepentirte.</strong> Devolvés el producto y te reintegramos el dinero.</span></li>
              <li><CheckCircleIcon size={20} weight="fill" /><span><strong>Garantía con factura.</strong> Cada compra lleva su factura para que la garantía sea simple.</span></li>
            </ul>
          </div>
        </Revelar>

        <Revelar id="preguntas" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Preguntas frecuentes</p>
            <h2 className="titulo-seccion">Lo que más nos preguntan</h2>
            <p className="bajada">Si tu duda no está acá, escribinos por <a href={whatsapp.link} target="_blank" rel="noopener noreferrer" className="link">WhatsApp al {whatsapp.texto}</a> y te respondemos.</p>
            <div className="faq">
              {preguntas.map(([p, r]) => (
                <details key={p}>
                  <summary>{p}<PlusIcon size={16} /></summary>
                  <p>{r}</p>
                </details>
              ))}
            </div>
          </div>
        </Revelar>

        <Revelar className="final">
          <div className="contenedor">
            <h2>Armá tu setup gamer<br />sin pagar todo junto</h2>
            <p className="bajada">Elegí tus productos y pagalos en cuotas con Mercado Pago.</p>
            <a href="#catalogo" className="btn btn-principal"><PlusIcon size={16} /> Elegir mi equipo</a>
          </div>
        </Revelar>
      </main>
      <a href={whatsapp.link} className="wa-flotante" target="_blank" rel="noopener noreferrer" aria-label={`Escribinos por WhatsApp al ${whatsapp.texto}`}>
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
      <Pie />
    </CarritoProvider>
  );
}
