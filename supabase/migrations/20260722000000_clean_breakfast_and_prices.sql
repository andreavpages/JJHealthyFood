DELETE FROM public.opciones_menu WHERE nombre = '2 waffles (regular)';

UPDATE public.opciones_menu
SET precio_racion = 7
WHERE categoria = 'desayuno';
