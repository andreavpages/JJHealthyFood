-- El negocio cambio de delivery a pickup: el cliente retira su pedido
-- en una sede fisica en vez de recibirlo en su casa. Se agrega una
-- tabla de sedes de retiro (la duena puede editar la direccion o
-- agregar mas de una) y se guarda una "foto" de la sede elegida en
-- cada pedido (nombre/direccion como texto), igual que ya se hace con
-- los nombres de proteinas/carbohidratos, para que un pedido viejo
-- conserve la direccion tal como era ese dia aunque la sede cambie
-- de direccion despues.

create table public.sedes_retiro (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null,
  activa boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- Nunca puede haber mas de una sede activa a la vez.
create unique index sedes_retiro_una_activa
  on public.sedes_retiro (activa)
  where activa;

alter table public.sedes_retiro enable row level security;

create policy "admin_full_access_sedes_retiro"
  on public.sedes_retiro for all
  to authenticated
  using (true)
  with check (true);

-- El catalogo publico necesita leer la sede activa para mostrarsela al
-- cliente (no es informacion sensible, es la direccion del negocio).
create policy "public_read_sedes_retiro"
  on public.sedes_retiro for select
  to anon
  using (true);

insert into public.sedes_retiro (nombre, direccion, activa, orden) values
  ('Sede Principal', 'Por definir', true, 1);

-- "Foto" de la sede elegida al momento del pedido.
alter table public.pedidos
  add column if not exists sede_nombre text,
  add column if not exists sede_direccion text;

-- La direccion del cliente ya no es obligatoria para armar el pedido
-- (ya no es a domicilio); se sigue guardando si existe de antes.
create or replace function public.upsert_clienta_publica(
  p_telefono text,
  p_nombre text,
  p_direccion text default null
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
  set nombre = p_nombre,
      direccion = coalesce(nullif(p_direccion, ''), direccion)
  where telefono = p_telefono
  returning id into v_id;

  if v_id is null then
    insert into clientas (nombre, telefono, direccion)
    values (p_nombre, p_telefono, nullif(p_direccion, ''))
    returning id into v_id;
  end if;

  return v_id;
end;
$$;
