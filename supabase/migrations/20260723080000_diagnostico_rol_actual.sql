-- Sigue fallando el insert publico aunque pg_policies muestra la
-- politica correcta para "anon". Se agrega esta funcion para confirmar
-- con que rol de Postgres esta ejecutando realmente la request hecha
-- con la anon/publishable key, en caso de que no sea literalmente
-- "anon" (posible con el nuevo sistema de API keys de Supabase).

create or replace function public.diagnostico_rol_actual()
returns table (rol_actual text, rol_sesion text, rol_jwt text)
language sql
security invoker
as $$
  select
    current_user::text,
    session_user::text,
    coalesce(current_setting('request.jwt.claim.role', true), 'sin claim')::text;
$$;

grant execute on function public.diagnostico_rol_actual() to anon, authenticated;
