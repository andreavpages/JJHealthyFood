-- Se revierte el prototipo de fotos por opcion de menu: la duena no
-- quedo conforme con como se veia. Se elimina la columna agregada en
-- 20260723041504_imagen_proteinas.sql en vez de editar esa migracion ya
-- aplicada.

alter table public.opciones_menu
  drop column if exists imagen_url;
