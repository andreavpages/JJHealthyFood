CREATE TABLE IF NOT EXISTS public.extras_config (
  id TEXT PRIMARY KEY,
  precio NUMERIC NOT NULL DEFAULT 0
);

-- Insert default values
INSERT INTO public.extras_config (id, precio) VALUES
  ('proteina_regular', 1),
  ('proteina_premium', 2),
  ('carbohidrato', 0.5),
  ('vegetal', 0)
ON CONFLICT (id) DO NOTHING;
