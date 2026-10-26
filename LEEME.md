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
