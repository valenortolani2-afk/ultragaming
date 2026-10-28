# Ultra Gaming

## Configurar el panel de productos en Vercel

Para habilitar `/admin`, configurá estas variables en el proyecto de Vercel:

1. Abrí **Settings → Environment Variables**.
2. Agregá `ADMIN_PASSWORD` con una contraseña larga y única. Seleccioná **Production** (y también **Preview** o **Development** si vas a usar el panel en esos entornos).
3. Guardá la variable y volvé a desplegar el proyecto desde **Deployments** para que se aplique.

No uses el prefijo `NEXT_PUBLIC_` en `ADMIN_PASSWORD`: es una contraseña y debe quedar disponible solo en el servidor. No la compartas ni la guardes en el repositorio.

### Almacenamiento de fotos y productos

El panel también requiere `BLOB_READ_WRITE_TOKEN`. Para configurarlo, abrí la pestaña **Storage** del proyecto en Vercel, creá un almacén **Blob** y conectalo al proyecto. Vercel agregará la variable necesaria. Luego, volvé a desplegar si Vercel no lo hizo automáticamente.

Cuando la configuración esté lista, entrá a `/admin` y escribí la contraseña de `ADMIN_PASSWORD`.

## Cobrar con Mercado Pago

El carrito de la página cobra con Mercado Pago (Checkout Pro). Para habilitarlo:

1. Entrá a [Tus integraciones de Mercado Pago](https://www.mercadopago.com.ar/developers/panel/app) y creá una aplicación de tipo **Pagos online → Checkout Pro**.
2. En **Credenciales de producción**, copiá el **Access Token** (empieza con `APP_USR-`).
3. En Vercel, en **Settings → Environment Variables**, agregá `MP_ACCESS_TOKEN` con ese valor. Sin el prefijo `NEXT_PUBLIC_`: es secreto y no se comparte ni se guarda en el repositorio.
4. Agregá también `BASE_URL` con la dirección pública de la página, con `https://` y sin barra al final (ej: `https://ultragaming.com.ar`). Mercado Pago la usa para devolver al cliente a `/compra` y para avisar los pagos en `/api/mercadopago`.
5. Volvé a desplegar el proyecto.

Para probar sin cobrar de verdad, usá las **credenciales de prueba** de la misma aplicación y las [tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards).

Cada pago aprobado aparece solo en la pestaña **Ventas** de `/admin`, con el costo, el precio cobrado y la ganancia. El producto sigue publicado: si era la última unidad, borralo desde el panel.

Sin `MP_ACCESS_TOKEN`, el carrito funciona pero al pagar le pide al cliente que escriba por WhatsApp.
