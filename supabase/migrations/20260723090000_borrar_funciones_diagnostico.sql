-- Se encontro la causa real del bloqueo de pedidos: no era la RLS
-- (esa siempre estuvo bien), sino que el codigo pedia de vuelta
-- (.select()) la fila recien insertada, algo que Postgres rechaza para
-- un rol sin politica de SELECT como "anon". El fix real quedo en el
-- codigo (crearPedido/crearComidasPedido ya no usan .select()). Estas
-- funciones fueron solo para diagnosticar y ya no hacen falta.

drop function if exists public.diagnostico_rls_pedidos();
drop function if exists public.diagnostico_rol_actual();
