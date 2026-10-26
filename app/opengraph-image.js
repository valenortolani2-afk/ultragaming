import { ImageResponse } from 'next/og';

export const alt = 'Ultra Gaming · Armá tu setup gamer sin pagar todo junto';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Imagen que aparece al compartir la tienda en redes y WhatsApp
export default function Imagen() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 96, background: '#050b14', color: '#fff' }}>
        <div style={{ fontSize: 30, color: '#39e62c', fontWeight: 700, marginBottom: 32 }}>ULTRA GAMING</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1 }}>Armá tu setup gamer</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, color: '#7cc4f2', marginTop: 16 }}>sin pagar todo junto</div>
        <div style={{ fontSize: 30, color: '#8fa6bd', marginTop: 48 }}>Cuotas con Mercado Pago · Envío a todo el país</div>
      </div>
    ),
    size
  );
}
