ALTER TABLE comidas_pedido
  ADD COLUMN IF NOT EXISTS gramos_proteina integer,
  ADD COLUMN IF NOT EXISTS gramos_carbohidrato integer;
