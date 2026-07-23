-- Tabla simple de configuracion (clave/valor) para ajustes del negocio
-- que la duena deberia poder cambiar sin depender de un desarrollador.
-- Primer uso: el numero de WhatsApp al que llegan los pedidos, que
-- hasta ahora solo se podia cambiar editando .env.local a mano.

create table public.configuracion (
  clave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);

alter table public.configuracion enable row level security;

-- La duena (autenticada) puede leer y cambiar la configuracion.
create policy "admin_full_access_configuracion"
  on public.configuracion for all
  to authenticated
  using (true)
  with check (true);

-- El catalogo publico necesita leer el numero de WhatsApp para armar
-- el link wa.me al enviar un pedido (no es informacion sensible).
create policy "public_read_configuracion"
  on public.configuracion for select
  to anon
  using (true);

insert into public.configuracion (clave, valor) values
  ('whatsapp_numero', '584242486237');
