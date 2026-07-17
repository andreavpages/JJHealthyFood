-- Funciones para el catalogo publico (sin login): permiten buscar y
-- guardar los datos minimos de una clienta por telefono sin exponer
-- la tabla completa a un rol anonimo (evita ampliar RLS de anon).

create or replace function public.buscar_clienta_por_telefono(telefono_buscado text)
returns table (nombre text, direccion text, zona_entrega text)
language sql
security definer
set search_path = public
as $$
  select nombre, direccion, zona_entrega
  from clientas
  where telefono = telefono_buscado
  limit 1;
$$;

grant execute on function public.buscar_clienta_por_telefono(text) to anon, authenticated;

create or replace function public.upsert_clienta_publica(
  p_telefono text,
  p_nombre text,
  p_direccion text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update clientas
  set nombre = p_nombre, direccion = p_direccion
  where telefono = p_telefono
  returning id into v_id;

  if v_id is null then
    insert into clientas (nombre, telefono, direccion)
    values (p_nombre, p_telefono, p_direccion)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

grant execute on function public.upsert_clienta_publica(text, text, text) to anon, authenticated;
