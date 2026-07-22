-- El menu real del negocio separa las proteinas en dos niveles de
-- precio (Sencilla/Premium), con un precio distinto segun si el pedido
-- es "por racion" o "macro". Tambien se agrega la categoria "vegetal".
-- Esto reemplaza el menu de prueba cargado en la migracion anterior.

-- Ampliar las categorias validas para incluir 'vegetal'.
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.opciones_menu'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%categoria%'
  loop
    execute format('alter table public.opciones_menu drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.opciones_menu
  add constraint opciones_menu_categoria_check
  check (categoria in ('proteina', 'carbohidrato', 'vegetal', 'desayuno'));

-- Nivel y precio por racion (solo aplican a categoria = 'proteina').
-- precio_macro_gramo aplica tanto a proteina como a carbohidrato: es la
-- tarifa por gramo que el cliente paga en modo "macro" (peso exacto).
-- Queda en NULL hasta que la duena la defina desde el panel.
alter table public.opciones_menu
  add column if not exists nivel text check (nivel in ('sencilla', 'premium')),
  add column if not exists precio_racion numeric(10, 2),
  add column if not exists precio_macro_gramo numeric(10, 4);

-- Reemplazar el menu de prueba por el menu real del negocio.
delete from public.opciones_menu;

insert into public.opciones_menu (categoria, nombre, nivel, precio_racion, orden) values
  ('proteina', 'Pechuga de pollo', 'sencilla', 9, 1),
  ('proteina', 'Cadera de pollo', 'sencilla', 9, 2),
  ('proteina', 'Carne de pavo', 'sencilla', 9, 3),
  ('proteina', 'Albóndigas', 'sencilla', 9, 4),
  ('proteina', 'Carne molida', 'sencilla', 9, 5),
  ('proteina', 'Cerdo', 'sencilla', 9, 6),
  ('proteina', 'Pimientos rellenos', 'sencilla', 9, 7),
  ('proteina', 'Steak', 'premium', 12, 8),
  ('proteina', 'Salmón', 'premium', 12, 9),
  ('proteina', 'Pescado', 'premium', 12, 10),
  ('proteina', 'Camarones grill', 'premium', 12, 11),
  ('proteina', 'Lasaña', 'premium', 12, 12);

insert into public.opciones_menu (categoria, nombre, orden) values
  ('carbohidrato', 'Quinoa', 1),
  ('carbohidrato', 'Malanga', 2),
  ('carbohidrato', 'Pasta protein', 3),
  ('carbohidrato', 'Batata', 4),
  ('carbohidrato', 'Mangú', 5),
  ('carbohidrato', 'Arroz', 6),
  ('carbohidrato', 'Yuca', 7),
  ('carbohidrato', 'Baby potatoes al horno', 8),
  ('carbohidrato', 'Sweet potatoes al horno', 9),
  ('vegetal', 'Brócoli', 1),
  ('vegetal', 'Coliflor', 2),
  ('vegetal', 'Green Beans', 3),
  ('vegetal', 'Espárragos', 4),
  ('vegetal', 'Zucchini', 5),
  ('desayuno', '2 waffles (regular)', 1),
  ('desayuno', '2 waffles + huevos', 2),
  ('desayuno', '2 waffles + blackberry', 3),
  ('desayuno', '2 waffles + huevo y bacon de pavo', 4);
