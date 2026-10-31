// Reglas del armador de PC (/arma-tu-pc). Todo se deduce del título de cada publicación,
// así que funciona con lo que se sube desde /admin sin cargar datos extra.
// Si un dato no aparece en el título, el producto se ofrece igual (no se lo bloquea por las dudas).

// Pasos del armado, en orden. categorias: de dónde salen las opciones de cada paso.
// Para sumar un paso, se crea la categoría en lib/categorias.js y se agrega acá.
export const pasos = [
  { id: 'procesador', titulo: 'Procesador', categorias: ['procesadores', 'combos'], ayuda: 'Elegí un procesador o un combo que ya trae la mother.' },
  { id: 'mother', titulo: 'Motherboard', categorias: ['motherboards'], ayuda: 'Te mostramos las que van con tu procesador.' },
  { id: 'memoria', titulo: 'Memoria RAM', categorias: ['memorias'], ayuda: 'Te mostramos las del tipo que usa tu mother (DDR4 o DDR5).' },
  { id: 'video', titulo: 'Placa de video', categorias: ['placas-de-video'], ayuda: 'La que más pesa en los juegos. Según cuál elijas, te decimos qué fuente necesitás.' },
  { id: 'almacenamiento', titulo: 'Almacenamiento', categorias: ['almacenamiento'], ayuda: 'Un SSD para el sistema y tus juegos.' },
  { id: 'gabinete', titulo: 'Gabinete', categorias: ['gabinetes'], ayuda: 'Te mostramos los que entran con tu mother.' },
  { id: 'fuente', titulo: 'Fuente', categorias: ['fuentes'], ayuda: 'Te mostramos las que alcanzan para tu placa de video.' },
  { id: 'monitor', titulo: 'Monitor', categorias: ['monitores'], opcional: true, ayuda: 'Opcional. Sumalo si también necesitás pantalla.' }
];

const normalizar = texto => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Chipset de la mother → socket del procesador
const chipsets = {
  1700: ['h610', 'b660', 'h670', 'z690', 'b760', 'h770', 'z790'],
  1851: ['h810', 'b860', 'z890'],
  1200: ['h410', 'b460', 'h470', 'z490', 'h510', 'b560', 'h570', 'z590'],
  AM4: ['a320', 'b350', 'x370', 'b450', 'x470', 'a520', 'b550', 'x570'],
  AM5: ['a620', 'b650', 'x670', 'b840', 'b850', 'x870']
};
// Memoria que usa cada socket. En 1700 hay mothers DDR4 y DDR5, así que ahí manda la mother.
const memoriaDelSocket = { AM5: 'DDR5', 1851: 'DDR5', AM4: 'DDR4', 1200: 'DDR4' };

// Socket escrito en el título (AM4, AM5, LGA 1700...)
const socketEscrito = t => (/\bam5\b/.test(t) && 'AM5') || (/\bam4\b/.test(t) && 'AM4') || t.match(/\b(?:lga\s*)?(1700|1851|1200)\b/)?.[1] || null;

// Socket según el modelo del procesador: Ryzen 5600 → AM4, Ryzen 7600 → AM5, Core i5-12400 → 1700, Core Ultra 245 → 1851
function socketDelProcesador(t) {
  const ryzen = t.match(/ryzen\s*[3579]?\s*(\d)\d{3}/);
  if (ryzen) return Number(ryzen[1]) <= 5 ? 'AM4' : 'AM5';
  if (/ultra\s*[3579]\s*2\d\d/.test(t)) return '1851';
  const core = t.match(/\bi[3579]\s*-?\s*(1\d)\d{3}/);
  if (core) return Number(core[1]) >= 12 ? '1700' : '1200';
  return null;
}

// Consumo aproximado de cada placa de video, en watts. Las "ti" / "xt" van antes que el modelo común.
const consumos = [
  [/5090/, 575], [/5080/, 360], [/5070\s*ti/, 300], [/5070/, 250], [/5060\s*ti/, 180], [/5060/, 145], [/5050/, 130],
  [/4090/, 450], [/4080/, 320], [/4070\s*ti/, 285], [/4070/, 200], [/4060\s*ti/, 165], [/4060/, 115],
  [/3090/, 350], [/3080\s*ti/, 350], [/3080/, 320], [/3070\s*ti/, 290], [/3070/, 220], [/3060\s*ti/, 200], [/3060/, 170], [/3050/, 130],
  [/gtx\s*16\d0/, 125], [/gtx\s*10\d0/, 120],
  [/9070\s*xt/, 304], [/9070/, 220], [/9060\s*xt/, 180], [/9060/, 150],
  [/7900/, 315], [/7800/, 263], [/7700/, 245], [/7600/, 165], [/6950|6900|6800/, 300], [/6750|6700/, 230], [/6650|6600/, 160], [/6500|6400/, 100]
];
const consumoProcesador = 125;
const consumoResto = 100;

const ddrEscrita = t => { const n = t.match(/\bd(?:dr)?\s*([45])\b/)?.[1]; return n ? 'DDR' + n : null; };

// Lo que se puede saber de un producto mirando su título
export function datosDe(p) {
  const t = normalizar(p.nombre);
  const d = {};
  const watts = Number(t.match(/(\d{3,4})\s*w\b/)?.[1]) || null;

  if (p.slug === 'combos' || p.slug === 'motherboards') {
    const chip = t.match(/\b([abhxz]\d{3})([mi])?\b/);
    d.socket = Object.keys(chipsets).find(s => chip && chipsets[s].includes(chip[1])) || socketEscrito(t) || socketDelProcesador(t);
    d.memoria = ddrEscrita(t) || memoriaDelSocket[d.socket] || null;
    // Tamaño de la mother: la M final del chipset (H610M) es Micro-ATX y la I es Mini-ITX
    d.formato = /\bitx\b/.test(t) || chip?.[2] === 'i' ? 'itx'
      : /m-?atx|micro/.test(t) || chip?.[2] === 'm' ? 'matx'
      : chip ? 'atx' : null;
    // Un combo trae procesador y mother juntos
    d.combo = p.slug === 'combos';
  }
  if (p.slug === 'procesadores') {
    d.socket = socketEscrito(t) || socketDelProcesador(t);
    d.memoria = memoriaDelSocket[d.socket] || null;
  }
  if (p.slug === 'memorias') {
    d.memoria = ddrEscrita(t);
    d.notebook = /sodimm|so-dimm|notebook/.test(t);
  }
  if (p.slug === 'placas-de-video') d.consumo = consumos.find(([r]) => r.test(t))?.[1] || null;
  if (p.slug === 'gabinetes') {
    // Hasta qué mother entra: si el título dice Micro-ATX o mini, no entra una ATX
    d.entra = /\bitx\b/.test(t) && !/m-?atx/.test(t) ? 'itx' : /m-?atx|\bmini\b/.test(t) ? 'matx' : 'atx';
    if (/\+\s*fuente|con fuente/.test(t) && !/sin fuente/.test(t)) d.fuente = watts || true;
  }
  if (p.slug === 'fuentes') d.watts = watts;
  return d;
}

const tamaños = { itx: 1, matx: 2, atx: 3 };
const nombresFormato = { itx: 'Mini-ITX', matx: 'Micro-ATX', atx: 'ATX' };

// Watts que recomendamos para la placa elegida (con margen, redondeado a 50)
export const fuenteRecomendada = consumo => Math.ceil((consumoProcesador + consumoResto + consumo) * 1.4 / 50) * 50;

// Lo que define la base de la PC: sale de la mother, del combo o, si no hay, del procesador
export function plataforma(elegidos) {
  const cpu = elegidos.procesador?.datos;
  const mother = elegidos.mother?.datos || (cpu?.combo ? cpu : null);
  return {
    socket: mother?.socket || cpu?.socket || null,
    memoria: mother?.memoria || cpu?.memoria || null,
    formato: mother?.formato || null,
    combo: Boolean(cpu?.combo)
  };
}

// Aviso de un paso que ya está cubierto por otra pieza (o necesita algo especial).
// cubierto: no hace falta elegir nada en ese paso.
export function notaDelPaso(id, elegidos) {
  if (id === 'mother' && elegidos.procesador?.datos.combo) return { texto: 'Tu combo ya trae la mother. Podés saltear este paso.', resumen: 'Incluida en el combo', cubierto: true };
  if (id === 'fuente') {
    const delGabinete = elegidos.gabinete?.datos.fuente;
    const consumo = elegidos.video?.datos.consumo;
    const recomendada = consumo ? fuenteRecomendada(consumo) : null;
    if (delGabinete) {
      const conWatts = typeof delGabinete === 'number';
      const corta = conWatts && recomendada && delGabinete < recomendada;
      return {
        texto: `Tu gabinete ya trae fuente${conWatts ? ` de ${delGabinete} W` : ''}.${corta ? ` Para tu placa de video te recomendamos una de ${recomendada} W.` : ' Podés saltear este paso.'}`,
        resumen: corta ? `La del gabinete (${delGabinete} W) no alcanza` : 'Incluida en el gabinete',
        cubierto: !corta, corta
      };
    }
    if (recomendada) return { texto: `Para tu placa de video te recomendamos una fuente de ${recomendada} W o más.`, cubierto: false };
  }
  return null;
}

// Si el producto no va con lo ya elegido, devuelve el motivo; si va, null
export function motivoIncompatible(paso, p, elegidos) {
  const d = p.datos;
  const otros = { ...elegidos, [paso]: undefined };
  const base = plataforma(otros);
  const memoria = otros.memoria?.datos.memoria;

  if (paso === 'procesador') {
    if (d.combo && otros.mother) return 'Trae su propia mother: quitá la que elegiste para usar este combo';
    if (d.socket && otros.mother?.datos.socket && d.socket !== otros.mother.datos.socket) return `Es socket ${d.socket} y tu mother es ${otros.mother.datos.socket}`;
    if (d.memoria && memoria && d.memoria !== memoria && (d.combo || !otros.mother)) return `Usa ${d.memoria} y tu memoria es ${memoria}`;
    if (d.combo && d.formato && otros.gabinete?.datos.entra && tamaños[d.formato] > tamaños[otros.gabinete.datos.entra]) return `Su mother es ${nombresFormato[d.formato]} y no entra en el gabinete que elegiste`;
  }
  if (paso === 'mother') {
    if (otros.procesador?.datos.combo) return 'Tu combo ya trae la mother';
    if (d.socket && base.socket && d.socket !== base.socket) return `Es socket ${d.socket} y tu procesador es ${base.socket}`;
    if (d.memoria && memoria && d.memoria !== memoria) return `Usa ${d.memoria} y tu memoria es ${memoria}`;
    if (d.formato && otros.gabinete?.datos.entra && tamaños[d.formato] > tamaños[otros.gabinete.datos.entra]) return `Es ${nombresFormato[d.formato]} y no entra en el gabinete que elegiste`;
  }
  if (paso === 'memoria') {
    if (d.notebook) return 'Es memoria de notebook';
    if (d.memoria && base.memoria && d.memoria !== base.memoria) return `Es ${d.memoria} y tu mother usa ${base.memoria}`;
  }
  if (paso === 'gabinete' && d.entra && base.formato && tamaños[base.formato] > tamaños[d.entra]) {
    return `Es para mother ${nombresFormato[d.entra]} y la tuya es ${nombresFormato[base.formato]}`;
  }
  const placa = otros.video?.datos;
  if (paso === 'fuente' && d.watts && placa?.consumo && d.watts < fuenteRecomendada(placa.consumo)) {
    return `Para tu placa de video necesitás al menos ${fuenteRecomendada(placa.consumo)} W`;
  }
  // La fuente que trae un gabinete no bloquea la placa: si no alcanza, en el paso Fuente se avisa y se puede sumar otra
  const watts = otros.fuente?.datos.watts;
  if (paso === 'video' && d.consumo && watts && watts < fuenteRecomendada(d.consumo)) {
    return `Necesita una fuente de ${fuenteRecomendada(d.consumo)} W y la tuya es de ${watts} W`;
  }
  return null;
}
