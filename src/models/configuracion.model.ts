import type { SupabaseClient } from "@supabase/supabase-js";

export async function obtenerConfiguracion(
  supabase: SupabaseClient,
  clave: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", clave)
    .maybeSingle();

  if (error) throw error;
  return data?.valor ?? null;
}

export async function actualizarConfiguracion(
  supabase: SupabaseClient,
  clave: string,
  valor: string
): Promise<void> {
  const { error } = await supabase
    .from("configuracion")
    .upsert({ clave, valor, updated_at: new Date().toISOString() });

  if (error) throw error;
}
