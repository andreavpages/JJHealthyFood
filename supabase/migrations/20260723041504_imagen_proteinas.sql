-- Foto opcional por opcion de menu (pensado principalmente para
-- proteinas, que es donde mas ayuda visualmente). Se sembra con fotos
-- de muestra (genericas, de prueba) en 3 proteinas para poder evaluar
-- como se ve el catalogo con imagenes antes de pedirle a la duena que
-- suba las fotos reales de sus platos.

alter table public.opciones_menu
  add column if not exists imagen_url text;

update public.opciones_menu set imagen_url = 'https://picsum.photos/seed/salmon-jj/400/300'
  where categoria = 'proteina' and nombre = 'Salmón';

update public.opciones_menu set imagen_url = 'https://picsum.photos/seed/steak-jj/400/300'
  where categoria = 'proteina' and nombre = 'Steak';

update public.opciones_menu set imagen_url = 'https://picsum.photos/seed/pollo-jj/400/300'
  where categoria = 'proteina' and nombre = 'Pechuga de pollo';
