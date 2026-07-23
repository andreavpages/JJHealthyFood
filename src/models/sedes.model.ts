import type { SupabaseClient } from "@supabase/supabase-js";
import type { SedeRetiro } from "./types";

export async function listarSedes(
  supabase: SupabaseClient
): Promise<SedeRetiro[]> {
  const { data, error } = await supabase
    .from("sedes_retiro")
    .select("*")
    .order("orden", { ascending: true });

  if (error) throw error;
  return data as SedeRetiro[];
}

export async function listarSedesActivas(
  supabase: SupabaseClient
): Promise<SedeRetiro[]> {
  const { data, error } = await supabase
    .from("sedes_retiro")
    .select("*")
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data as SedeRetiro[];
}

export async function crearSede(
  supabase: SupabaseClient,
  nombre: string,
  direccion: string
): Promise<SedeRetiro> {
  const { data, error } = await supabase
    .from("sedes_retiro")
    .insert({ nombre, direccion })
    .select()
    .single();

  if (error) throw error;
  return data as SedeRetiro;
}

export async function actualizarSede(
  supabase: SupabaseClient,
  id: string,
  cambios: { nombre?: string; direccion?: string }
): Promise<void> {
  const { error } = await supabase
    .from("sedes_retiro")
    .update(cambios)
    .eq("id", id);

  if (error) throw error;
}

export async function alternarSede(
  supabase: SupabaseClient,
  id: string,
  activa: boolean
): Promise<void> {
  const { error } = await supabase
    .from("sedes_retiro")
    .update({ activa })
    .eq("id", id);
  if (error) throw error;
}

export async function eliminarSede(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("sedes_retiro").delete().eq("id", id);
  if (error) throw error;
}
