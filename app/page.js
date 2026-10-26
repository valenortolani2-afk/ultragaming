import Image from 'next/image';
import {
  ChatsCircleIcon, HandPointingIcon, InstagramLogoIcon, PlusIcon, ShieldCheckIcon, StorefrontIcon,
  TruckIcon, WhatsappLogoIcon, WrenchIcon
} from '@phosphor-icons/react/dist/ssr';
import { consultar, garantia, instagram, marcas, whatsapp } from '../lib/contacto';
import { productos } from '../lib/productos';
import { listarPublicaciones } from '../lib/publicaciones';

// Se arma en cada visita para mostrar al instante lo que se sube desde /admin
export const dynamic = 'force-dynamic';
import Nav from './Nav';
import Vidriera from './Vidriera';
import { FraseReveladora, Revelar } from './Revelar';

const beneficios = [
  { icono: ShieldCheckIcon, titulo: `${garantia} de garantía`, texto: 'En todos los productos. Si algo falla, lo revisamos y te lo resolvemos.', destacada: true },
  { icono: WrenchIcon, titulo: 'Servicio técnico propio', texto: 'Reparación, limpieza y actualización de tu PC en el local.' },
  { icono: ChatsCircleIcon, titulo: 'Asesoramiento personalizado', texto: 'Te ayudamos a elegir piezas compatibles con lo que ya tenés.' },
  { icono: TruckIcon, titulo: 'Envíos a todo el país', texto: 'Coordinamos el envío por WhatsApp apenas confirmás la compra.' }
];

const pasos = [
  { titulo: 'Tocá el producto', texto: 'Mirá fotos, precio, detalles y garantía en un solo lugar.' },
  { titulo: 'Consultá por WhatsApp', texto: 'El mensaje sale con el producto y el precio ya escritos.' },
  { titulo: 'Retiralo o te lo enviamos', texto: 'Pasás por el local o lo despachamos a todo el país.' }
];

const preguntas = [
  [`¿Qué cubre la garantía de ${garantia}?`, `Cubre fallas de funcionamiento durante ${garantia} desde la compra. Traés el producto o nos escribís, lo revisa nuestro servicio técnico y lo reparamos o cambiamos. No cubre golpes, humedad ni daños por mal uso.`],
  ['¿Los precios están actualizados?', 'Sí, pero el stock se mueve rápido. Antes de pagar te confirmamos precio y disponibilidad por WhatsApp.'],
  ['¿Qué formas de pago aceptan?', 'Consultanos por WhatsApp las formas de pago y las cuotas vigentes para tu tarjeta.'],
  ['¿Hacen envíos?', 'Sí, a todo el país. El costo y el tiempo dependen de tu ciudad y te los pasamos antes de despachar.'],
  ['¿Me ayudan a elegir los componentes?', 'Sí. Contanos qué querés jugar o qué equipo tenés y te armamos opciones compatibles para tu presupuesto.'],
  ['¿Hacen servicio técnico?', 'Sí. Reparamos, limpiamos y actualizamos computadoras. Escribinos y te pasamos un presupuesto.']
];

export default async function Inicio() {
  // Primero lo subido desde /admin (más nuevo arriba), después los productos fijos de lib/productos.js
  const vidriera = [...await listarPublicaciones(), ...productos];
  return (
    <>
      <div className="franja">{garantia} de garantía en todos los productos · Envíos a todo el país</div>
      <Nav />

      <main id="contenido">
        <section className="hero">
          <Image src="/local-ultra-gaming.jpg" alt="Frente del local de Ultra Gaming con el cartel del pulpo" fill priority sizes="100vw" className="hero-foto" />
          <div className="contenedor">
            <div className="hero-panel">
              <p className="etiqueta">Tienda informática · Ofertas</p>
              <h1 className="degrade">Hardware gamer con{' '}<br />{garantia} de garantía</h1>
              <p className="bajada">PCs outlet, combos, placas de video y componentes de ASUS, MSI, Zotac y más. Tocá cada producto para ver precio y detalles.</p>
              <a href="#ofertas" className="btn btn-azul"><HandPointingIcon size={16} /> Ver las ofertas</a>
              <div className="prueba">
                <span><ShieldCheckIcon size={16} weight="fill" /> Garantía de {garantia}</span>
                <span><WrenchIcon size={16} /> Servicio técnico propio</span>
                <span><TruckIcon size={16} /> Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </section>

        <section id="ofertas" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Ofertas</p>
            <h2 className="titulo">Tocá un producto para ver todo</h2>
            <Vidriera productos={vidriera} />
          </div>
        </section>

        <section className="marcas" aria-label="Marcas que vendemos">
          <div className="contenedor">
            <p>Vendemos las marcas</p>
            <ul>{marcas.map(m => <li key={m}>{m}</li>)}</ul>
          </div>
        </section>

        <section className="seccion frase" aria-label="Nuestra propuesta">
          <div className="contenedor">
            <FraseReveladora lineas={['Tocás el producto.', 'Ves el precio.', `Te lo llevás con ${garantia} de garantía.`]} />
          </div>
        </section>

        <Revelar id="garantia" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Por qué comprar acá</p>
            <h2 className="titulo">Comprás con respaldo de verdad</h2>
            <p className="bajada">Somos un local físico con servicio técnico. Si algo pasa, sabés dónde encontrarnos.</p>
            <div className="beneficios">
              {beneficios.map(({ icono: Icono, titulo, texto, destacada }) => (
                <div key={titulo} className={'caja' + (destacada ? ' destacada' : '')}>
                  <Icono size={32} weight={destacada ? 'fill' : 'light'} />
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </Revelar>

        <Revelar className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Cómo comprar</p>
            <h2 className="titulo">Tres pasos y es tuyo</h2>
            <p className="bajada">Sin registrarte y sin vueltas.</p>
            <div className="pasos">
              {pasos.map((p, i) => (
                <div key={p.titulo} className="caja">
                  <b>{i + 1}</b>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </Revelar>

        <Revelar className="seccion">
          <div className="contenedor asesor">
            <div>
              <p className="etiqueta">Asesoramiento</p>
              <h2 className="titulo">¿No sabés qué elegir?</h2>
              <p className="bajada">Contanos qué juegos usás y tu presupuesto. Te armamos opciones compatibles con lo que ya tenés.</p>
            </div>
            <a href={consultar('Hola Ultra Gaming, quiero asesoramiento para elegir mi equipo.')} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
              <WhatsappLogoIcon size={16} weight="fill" /> Pedir asesoramiento
            </a>
          </div>
        </Revelar>

        <Revelar id="preguntas" className="seccion">
          <div className="contenedor">
            <p className="etiqueta">Preguntas frecuentes</p>
            <h2 className="titulo">Lo que más nos preguntan</h2>
            <p className="bajada">Si tu duda no está acá, escribinos al {whatsapp.texto}.</p>
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

        <Revelar id="local" className="seccion">
          <div className="contenedor local">
            <div className="local-foto">
              <Image src="/local-ultra-gaming.jpg" alt="Vidriera del local de Ultra Gaming" fill sizes="(max-width: 960px) 100vw, 600px" />
            </div>
            <div>
              <p className="etiqueta"><StorefrontIcon size={14} weight="fill" /> El local</p>
              <h2 className="degrade">Hardware gamer con<br />{garantia} de garantía</h2>
              <p className="bajada">Vení a ver los productos, traé tu PC al servicio técnico o escribinos y te lo enviamos.</p>
              <div className="contactos">
                <a href="#ofertas" className="btn btn-azul"><HandPointingIcon size={16} /> Ver las ofertas</a>
                <a href={whatsapp.link} className="btn btn-gris" target="_blank" rel="noopener noreferrer"><WhatsappLogoIcon size={16} /> {whatsapp.texto}</a>
                <a href={instagram.link} className="btn btn-gris" target="_blank" rel="noopener noreferrer"><InstagramLogoIcon size={16} /> {instagram.texto}</a>
              </div>
            </div>
          </div>
        </Revelar>
      </main>

      <footer className="pie">
        <div className="contenedor">
          <p>© 2026 Ultra Gaming · Tienda informática · Servicio técnico</p>
          <nav aria-label="Contacto">
            <a href={whatsapp.link} target="_blank" rel="noopener noreferrer"><WhatsappLogoIcon size={16} /> {whatsapp.texto}</a>
            <a href={instagram.link} target="_blank" rel="noopener noreferrer"><InstagramLogoIcon size={16} /> {instagram.texto}</a>
          </nav>
        </div>
      </footer>

      <a href={whatsapp.link} className="wa-flotante" target="_blank" rel="noopener noreferrer" aria-label={`Escribinos por WhatsApp al ${whatsapp.texto}`}>
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
    </>
  );
}
