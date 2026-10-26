# Ultra Gaming · Tienda (Next.js + React)

## Arrancar la tienda
- Para trabajar: `npm run dev` y entrá a http://localhost:3000
- Versión final: `npm run build` y después `npm start`

## Cargar productos (con 10% de recargo)
1. Poné la lista de tu proveedor en `proveedor.csv` con estas columnas:
   `nombre;marca;categoria;precio;imagen;descripcion`
   (`precio` es el costo del proveedor; `imagen` es opcional, un link a la foto).
2. Ejecutá `npm run importar`. Se genera `productos.json` con el precio + 10%.
3. Para cambiar el recargo, editá `RECARGO` en `importar.js`.

## Conectar Mercado Pago
1. Copiá `.env.example` como `.env`.
2. En `MP_ACCESS_TOKEN` pegá tu Access Token de Mercado Pago
   (primero el de prueba, `TEST-...`; después el de producción, `APP_USR-...`).
3. Reiniciá el servidor.

El `.env` nunca se manda al navegador. No lo compartas con nadie.

## Publicaciones de cada rubro (Vercel Blob)
Cada tarjeta de "Qué vendemos" abre su página, por ejemplo `/rubros/placas-de-video`, con las publicaciones de ese rubro.

1. En Vercel, dentro de tu proyecto: Storage > Create > Blob. Conectalo al proyecto.
2. En Settings > Environment Variables agregá `ADMIN_PASSWORD` con una contraseña larga.
3. Para probar en tu compu, copiá `BLOB_READ_WRITE_TOKEN` y `ADMIN_PASSWORD` a tu `.env`.
4. Entrá a `/admin`, elegí el rubro, cargá título, precio (opcional), descripción y hasta 8 fotos, y tocá Publicar.
5. Desde el mismo panel podés borrar publicaciones (se borran también sus fotos).

Los rubros (nombre, texto y foto de portada) están en `lib/rubros.js`.

## Dónde está cada cosa
- `app/page.js`: página principal (portada, beneficios, cómo comprar, preguntas frecuentes).
- `app/Catalogo.js`: catálogo, buscador y filtros.
- `app/carrito.js`: carrito y panel de pago.
- `app/Nav.js`: barra de navegación y menú del celular.
- `app/api/checkout/route.js`: crea el cobro en Mercado Pago.
- `app/gracias/page.js`: página a la que vuelve el cliente después de pagar.
- `app/legales/page.js`: privacidad, términos y botón de arrepentimiento (completá los datos entre [ ]).
- `app/globals.css`: colores y diseño.
