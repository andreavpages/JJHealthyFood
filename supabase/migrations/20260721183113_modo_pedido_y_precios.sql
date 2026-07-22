-- El cliente ahora elige, una sola vez por pedido, si sus comidas son
-- "por racion" (porcion estandar) o "macro" (el cliente escribe los
-- gramos exactos de proteina y de carbohidrato que quiere). Ademas cada
-- comida puede llevar un vegetal y su precio ya calculado.

alter table public.pedidos
  add column modo text not null default 'racion' check (modo in ('racion', 'macro'));

alter table public.comidas_pedido
  add column vegetal text,
  add column gramos_proteina numeric(6, 1),
  add column gramos_carbohidrato numeric(6, 1),
  add column precio numeric(10, 2) not null default 0;
