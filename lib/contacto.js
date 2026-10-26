// Datos del local (tomados del cartel). Si cambian, se actualizan solo acá.
const numero = '5492233478786';

// Link de WhatsApp con un mensaje ya escrito
export const consultar = mensaje => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

export const whatsapp = {
  texto: '223 347-8786',
  link: consultar('Hola Ultra Gaming, les escribo desde la página web.')
};

export const instagram = {
  texto: '@ultra.gamingz',
  link: 'https://www.instagram.com/ultra.gamingz/'
};

// Marcas que vende el local
export const marcas = ['Moza', 'Redragon', 'Logitech', 'Nisuta', 'ASRock', 'MSI', 'ASUS', 'Zotac', 'Corsair'];
export const memorias = ['DDR4', 'DDR5'];

// Une una lista como texto: "A, B y C"
export const listar = l => l.length > 1 ? l.slice(0, -1).join(', ') + ' y ' + l.at(-1) : l.join('');
