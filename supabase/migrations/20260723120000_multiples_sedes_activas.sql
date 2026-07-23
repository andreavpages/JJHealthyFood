-- La duena quiere ofrecer mas de una sede al mismo tiempo y que el
-- cliente elija en cual retira (no solo una sede fija). Se quita la
-- restriccion de "una sola activa" y se habilitan las que ya existen.

drop index if exists public.sedes_retiro_una_activa;

update public.sedes_retiro set activa = true;
