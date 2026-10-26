// Datos del local. Si cambian, se actualizan solo acá.
const numero = '5492233478786';

// Link de WhatsApp con un mensaje ya escrito
export const consultar = mensaje => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

export const whatsapp = {
  texto: '223 347-8786',
  link: consultar('Hola Ultra Gaming, les escribo desde la página web.')
};

export const instagram = { texto: '@ultra.gamingz', link: 'https://www.instagram.com/ultra.gamingz/' };

export const marcas = ['Moza', 'Redragon', 'Logitech', 'Nisuta', 'ASRock', 'MSI', 'ASUS', 'Zotac', 'Corsair'];

export const garantia = '4 meses';

export const pesos = n => '$' + n.toLocaleString('es-AR');
