// Convierte la lista del proveedor (proveedor.csv) en productos.json con el recargo aplicado.
// Uso: node importar.js   (o: node importar.js otra-lista.csv)
const fs = require('fs');

const RECARGO = 0.10; // 10% sobre el precio del proveedor
const archivo = process.argv[2] || 'proveedor.csv';

const lineas = fs.readFileSync(archivo, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
const sep = lineas[0].includes(';') ? ';' : ',';
const columnas = lineas[0].split(sep).map(c => c.trim().toLowerCase());

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const numero = s => Number(String(s).replace(/[$\s.]/g, '').replace(',', '.'));

const productos = lineas.slice(1).map(linea => {
  const valores = linea.split(sep);
  const fila = Object.fromEntries(columnas.map((c, i) => [c, (valores[i] || '').trim()]));
  const costo = numero(fila.precio);
  if (!fila.nombre || !costo) return null;
  return {
    id: slug(fila.nombre),
    nombre: fila.nombre,
    marca: fila.marca || '',
    categoria: fila.categoria || 'Otros',
    precio: Math.round(costo * (1 + RECARGO) / 10) * 10, // redondeado a $10
    imagen: fila.imagen || '',
    descripcion: fila.descripcion || ''
  };
}).filter(Boolean);

fs.writeFileSync('productos.json', JSON.stringify(productos, null, 2));
console.log(`Listo: ${productos.length} productos guardados en productos.json con ${RECARGO * 100}% de recargo.`);
