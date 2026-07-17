-- MVP schema for JJ Healthy Food: clientas, pedidos, comidas_pedido + RLS

create extension if not exists "pgcrypto";

-- ============================================================
-- clientas
-- ============================================================
create table public.clientas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null unique,
  direccion text,
  zona_entrega text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- pedidos
-- ============================================================
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  clienta_id uuid not null references public.clientas (id) on delete restrict,
  fecha_pedido timestamptz not null default now(),
  dia_entrega text not null check (dia_entrega in ('miercoles', 'jueves')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_preparacion', 'entregado')),
  precio_total numeric(10, 2) not null check (precio_total >= 0),
  notas text
);

create index pedidos_clienta_id_idx on public.pedidos (clienta_id);
create index pedidos_estado_idx on public.pedidos (estado);
create index pedidos_fecha_pedido_idx on public.pedidos (fecha_pedido);

-- ============================================================
-- comidas_pedido (entidad debil: depende de pedidos)
-- ============================================================
create table public.comidas_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  numero_comida smallint not null check (numero_comida between 1 and 5),
  proteina text not null,
  carbohidrato text not null,
  extra text,
  es_desayuno boolean not null default false,
  unique (pedido_id, numero_comida),
  check (
    (es_desayuno and numero_comida = 5) or (not es_desayuno and numero_comida <> 5)
  )
);

create index comidas_pedido_pedido_id_idx on public.comidas_pedido (pedido_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.clientas enable row level security;
alter table public.pedidos enable row level security;
alter table public.comidas_pedido enable row level security;

-- La dueña (unica cuenta autenticada en Supabase Auth) puede leer y
-- gestionar todo desde el dashboard.
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

-- El catalogo publico (clientas sin cuenta) solo puede CREAR su propio
-- pedido: insertar, nunca leer, editar ni borrar. Esto evita que
-- cualquiera pueda consultar pedidos o datos de otras clientas.
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
