// Datos del local. Si cambian, se actualizan solo acá.
const numero = '5492233478786';

// Link de WhatsApp con un mensaje ya escrito
export const consultar = mensaje => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

// Pasa un teléfono argentino escrito de cualquier forma ("011 15-2345-6789", "+54 9 223 347 8786",
// "223 3478786") al formato que usa WhatsApp: 549 + característica + número, sin 0 ni 15.
export function numeroWhatsapp(telefono) {
  let d = String(telefono || '').replace(/\D/g, '').replace(/^00/, '');
  if (d.startsWith('54')) d = d.slice(2).replace(/^9/, '');
  d = d.replace(/^0/, '');
  // Con el 15 quedan 12 números: se saca el 15 que va después de la característica (de 2 a 4 números)
  if (d.length === 12) {
    const i = [2, 3, 4].find(n => d.slice(n, n + 2) === '15');
    if (i) d = d.slice(0, i) + d.slice(i + 2);
  }
  return d.length === 10 ? `549${d}` : null;
}

// Link para escribirle a un cliente por WhatsApp sin agendarlo
export function escribirA(telefono, mensaje) {
  const n = numeroWhatsapp(telefono);
  return n && `https://wa.me/${n}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`;
}

export const whatsapp = {
  texto: '223 347-8786',
  link: consultar('Hola Ultra Gaming, les escribo desde la página web.')
};

export const instagram = { texto: '@ultra.gamingz', link: 'https://www.instagram.com/ultra.gamingz/' };

export const marcas = ['Moza', 'Redragon', 'Logitech', 'Nisuta', 'ASRock', 'MSI', 'ASUS', 'Zotac', 'Corsair'];

export const garantia = '4 meses';

export const pesos = n => '$' + n.toLocaleString('es-AR');
