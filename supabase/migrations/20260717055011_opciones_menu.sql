-- Menu editable desde el dashboard: proteinas, carbohidratos y opciones
-- de desayuno que usa el catalogo publico. Antes vivian fijas en el
-- codigo (src/lib/menu-catalogo.ts); ahora la duena puede agregar o
-- quitar opciones sin tocar codigo.

create table public.opciones_menu (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('proteina', 'carbohidrato', 'desayuno')),
  nombre text not null,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  unique (categoria, nombre)
);

create index opciones_menu_categoria_idx on public.opciones_menu (categoria, orden);

alter table public.opciones_menu enable row level security;

-- La duena (autenticada) puede agregar, editar y quitar opciones.
create policy "admin_full_access_opciones_menu"
  on public.opciones_menu for all
  to authenticated
  using (true)
  with check (true);

-- El catalogo publico (sin login) solo necesita leerlas.
create policy "public_read_opciones_menu"
  on public.opciones_menu for select
  to anon
  using (true);

-- Semilla: las opciones que ya existian fijas en el codigo.
insert into public.opciones_menu (categoria, nombre, orden) values
  ('proteina', 'Lasagña', 1),
  ('proteina', 'Salmón', 2),
  ('proteina', 'Pescado', 3),
  ('proteina', 'Cerdo', 4),
  ('proteina', 'Albóndigas', 5),
  ('proteina', 'Pechuga de pollo', 6),
  ('proteina', 'Cadera de pollo', 7),
  ('proteina', 'Carne de pavo', 8),
  ('proteina', 'Camarones grill', 9),
  ('proteina', 'Pimentones relleno', 10),
  ('proteina', 'Steak y carne molida', 11),
  ('carbohidrato', 'Quinoa', 1),
  ('carbohidrato', 'Malanga', 2),
  ('carbohidrato', 'Pasta', 3),
  ('carbohidrato', 'Batata', 4),
  ('carbohidrato', 'Mangu', 5),
  ('carbohidrato', 'Arroz', 6),
  ('carbohidrato', 'Yuca', 7),
  ('carbohidrato', 'Baby potatoes (horno)', 8),
  ('carbohidrato', 'Sweet potatoes (horno)', 9),
  ('desayuno', 'Waffles solos', 1),
  ('desayuno', 'Waffles + huevos', 2),
  ('desayuno', 'Waffles + fruta', 3);
