// Marcas que se reconocen en el título de cada producto, para el menú por marca del catálogo.
// Cada una puede tener una expresión propia para las formas en que aparece escrita (ej: "COLER MASTER").
// Para sumar una marca nueva, se agrega a esta lista.
const marcas = [
  ['Cooler Master', /\bco+ler\s*master\b/i],
  ['Formula V', /\bformula\s*v\b/i],
  ['XPG', /\b(adata\s*)?xpg\b/i],
  ['ASRock', /\bas\s?rock\b/i],
  ['T-Force', /\b(t-?force|teamgroup)\b/i],
  ['Western Digital', /\b(western\s*digital|wd)\b/i],
  ['Lian Li', /\blian\s*li\b/i],
  ['HP', /\bhp\b/i],
  ['LG', /\blg\b/i],
  ...[
    'ASUS', 'MSI', 'Gigabyte', 'Zotac', 'Gainward', 'Palit', 'PNY', 'Sapphire', 'PowerColor', 'XFX', 'EVGA', 'Inno3D',
    'Corsair', 'Evolabs', 'Raptor', 'Redragon', 'Solarmax', 'Adata', 'Thermaltake', 'NZXT', 'Deepcool', 'Sentey', 'Gamemax',
    'Aerocool', 'Antec', 'Kingston', 'HyperX', 'Crucial', 'Seagate', 'Hiksemi', 'Patriot', 'Samsung', 'Logitech', 'Razer',
    'Moza', 'Nisuta', 'Genius', 'Arkham', 'Dahua', 'ViewSonic', 'AOC', 'BenQ', 'Philips', 'Lenovo', 'Acer', 'Seasonic',
    'Intel', 'AMD'
  ].map(m => [m, new RegExp(`\\b${m}\\b`, 'i')])
];

// AMD e Intel suelen ser el chip ("PLACA DE VIDEO AMD ASUS PRIME..."): solo cuentan si no aparece otra marca
const chips = ['AMD', 'Intel'];

// Devuelve la marca del producto: la cargada a mano si la hay, o la primera que aparece en el título
export function marcaDe(p) {
  if (p.marca) return p.marca;
  const titulo = p.nombre || '';
  const encontradas = marcas
    .map(([nombre, regex]) => ({ nombre, index: regex.exec(titulo)?.index ?? -1 }))
    .filter(m => m.index >= 0)
    .sort((a, b) => chips.includes(a.nombre) - chips.includes(b.nombre) || a.index - b.index);
  return encontradas[0]?.nombre || null;
}
