-- La tabla extras_config (precios de los "extras") se creo sin RLS,
-- a diferencia del resto de las tablas del proyecto. Se protege igual
-- que opciones_menu: la duena (autenticada) puede editar los precios,
-- el publico solo puede leerlos (los necesita para calcular el total
-- del pedido antes de enviarlo).

alter table public.extras_config enable row level security;

create policy "admin_full_access_extras_config"
  on public.extras_config for all
  to authenticated
  using (true)
  with check (true);

create policy "public_read_extras_config"
  on public.extras_config for select
  to anon
  using (true);
