import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoriaMenu, OpcionMenu } from "./types";

export async function listarOpcionesMenu(
  supabase: SupabaseClient
): Promise<OpcionMenu[]> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .select("*")
    .order("categoria", { ascending: true })
    .order("orden", { ascending: true });

  if (error) throw error;
  return data as OpcionMenu[];
}

export async function agregarOpcionMenu(
  supabase: SupabaseClient,
  categoria: CategoriaMenu,
  nombre: string
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .insert({ categoria, nombre })
    .select()
    .single();

  if (error) throw error;
  return data as OpcionMenu;
}

export async function eliminarOpcionMenu(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("opciones_menu").delete().eq("id", id);
  if (error) throw error;
}
