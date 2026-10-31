import { Geist } from 'next/font/google';
import './globals.css';
import { CarritoProvider } from './Carrito';

const geist = Geist({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font' });

export const metadata = {
  // Cuando la publiques, cargá BASE_URL con tu dirección (ej: https://ultragaming.com.ar)
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: 'Ultra Gaming · Hardware gamer con hasta 12 meses de garantía',
  description: 'PCs outlet, combos de actualización, placas de video, motherboards, fuentes, gabinetes y monitores. 12 meses de garantía en productos nuevos y 4 meses en outlet. Consultá por WhatsApp.',
  openGraph: {
    title: 'Ultra Gaming · Hardware gamer con hasta 12 meses de garantía',
    description: 'Tocá cada producto para ver precio y detalles. Envíos a todo el país.',
    images: ['/local-ultra-gaming.jpg'],
    locale: 'es_AR',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={geist.variable}>
      <body>
        <a href="#contenido" className="skip">Saltar al contenido</a>
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
