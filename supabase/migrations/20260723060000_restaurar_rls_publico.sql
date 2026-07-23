-- Diagnostico: los pedidos publicos empezaron a fallar con
-- "new row violates row-level security policy" en las 3 tablas base
-- (clientas, pedidos, comidas_pedido), confirmado con pruebas directas
-- via REST con la anon key. Las politicas de insert publico definidas
-- en 20260716044838_init_schema.sql ya no coinciden con lo que hay en
-- la base real (drift, posiblemente por un cambio manual en el panel
-- de Supabase). Se recrean desde cero en vez de asumir que siguen ahi.

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('clientas', 'pedidos', 'comidas_pedido')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.clientas enable row level security;
alter table public.pedidos enable row level security;
alter table public.comidas_pedido enable row level security;

grant insert on public.clientas to anon;
grant insert on public.pedidos to anon;
grant insert on public.comidas_pedido to anon;

create policy "admin_full_access_clientas"
  on public.clientas for all
  to authenticated
  using (true)
  with check (true);

create policy "admin_full_access_pedidos"
  on public.pedidos for all
  to authenticated
  using (true)
  with check (true);

create policy "admin_full_access_comidas_pedido"
  on public.comidas_pedido for all
  to authenticated
  using (true)
  with check (true);

create policy "public_insert_clientas"
  on public.clientas for insert
  to anon
  with check (true);

create policy "public_insert_pedidos"
  on public.pedidos for insert
  to anon
  with check (true);

create policy "public_insert_comidas_pedido"
  on public.comidas_pedido for insert
  to anon
  with check (true);
