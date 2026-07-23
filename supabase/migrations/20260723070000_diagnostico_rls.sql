-- Funcion temporal de diagnostico: el fix de RLS en
-- 20260723060000_restaurar_rls_publico.sql no esta funcionando segun
-- las pruebas via REST (sigue bloqueando el insert publico), a pesar de
-- que el push no reporto errores. Esta funcion expone que politicas
-- existen realmente en la base para poder confirmarlo en vez de seguir
-- adivinando. Se debe borrar (nueva migracion) una vez resuelto.

create or replace function public.diagnostico_rls_pedidos()
returns table (
  tabla text,
  politica text,
  permisiva text,
  roles text,
  comando text,
  con_check text
)
language sql
security definer
set search_path = public
as $$
  select
    tablename::text,
    policyname::text,
    permissive::text,
    roles::text,
    cmd::text,
    with_check::text
  from pg_policies
  where schemaname = 'public'
    and tablename in ('clientas', 'pedidos', 'comidas_pedido');
$$;

grant execute on function public.diagnostico_rls_pedidos() to anon;
