-- El catalogo publico ahora deja que la clienta elija cuantas comidas
-- quiere (1 a 5) y el tipo de cada una (regular o desayuno), en vez de
-- forzar que el desayuno sea siempre la comida numero 5. Se elimina la
-- restriccion que amarraba es_desayuno a numero_comida = 5.

do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.comidas_pedido'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%es_desayuno%'
  loop
    execute format('alter table public.comidas_pedido drop constraint %I', r.conname);
  end loop;
end $$;
