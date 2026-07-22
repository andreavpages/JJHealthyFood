-- Precio fijo por comida en modo macro (solo aplica a proteinas).
-- Sencillas: $12, Premium: $14
-- Los gramos que elige el cliente son solo indicacion para la cocina,
-- no afectan el precio.

ALTER TABLE public.opciones_menu
  ADD COLUMN IF NOT EXISTS precio_macro_gramo numeric;

update public.opciones_menu
set precio_macro_gramo = 12
where categoria = 'proteina' and nivel = 'sencilla';

update public.opciones_menu
set precio_macro_gramo = 14
where categoria = 'proteina' and nivel = 'premium';
