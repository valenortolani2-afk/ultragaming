'use client';

import Image from 'next/image';

// Las fotos de Cloudinary se piden achicadas a Cloudinary mismo (f_auto: WebP o AVIF según el navegador),
// así no gastan la optimización de imágenes de Vercel. El resto pasa por next/image como siempre.
const deCloudinary = ({ src, width }) => src.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);

export default function Foto(props) {
  const esDeCloudinary = typeof props.src === 'string' && props.src.startsWith('https://res.cloudinary.com/');
  return <Image {...props} loader={esDeCloudinary ? deCloudinary : undefined} />;
}
