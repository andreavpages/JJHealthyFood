-- El negocio cambio sus dias de entrega de miercoles/jueves a
-- domingo/lunes. Se remapean los pedidos de prueba existentes antes de
-- endurecer la restriccion, para no romper filas ya creadas.

update public.pedidos set dia_entrega = 'domingo' where dia_entrega = 'miercoles';
update public.pedidos set dia_entrega = 'lunes' where dia_entrega = 'jueves';

do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.pedidos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%dia_entrega%'
  loop
    execute format('alter table public.pedidos drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.pedidos
  add constraint pedidos_dia_entrega_check
  check (dia_entrega in ('domingo', 'lunes'));
