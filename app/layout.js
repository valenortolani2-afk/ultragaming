import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font' });

export const metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: 'Ultra Gaming · Periféricos y monitores gamer en cuotas',
  description: 'Mouse, teclados, auriculares y monitores gamer con garantía. Pagás en cuotas con Mercado Pago y te lo enviamos a todo el país.',
  openGraph: {
    title: 'Ultra Gaming · Armá tu setup gamer sin pagar todo junto',
    description: 'Periféricos y monitores gamer en cuotas con Mercado Pago y envío a todo el país.',
    locale: 'es_AR',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={geist.variable}>
      <body>
        <a href="#contenido" className="skip">Saltar al contenido</a>
        {children}
      </body>
    </html>
  );
}
