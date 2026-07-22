import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoriaMenu, NivelProteina, OpcionMenu } from "./types";

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
  nombre: string,
  detalles?: {
    nivel?: NivelProteina;
    precioRacion?: number;
    precioMacroGramo?: number;
  }
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .insert({
      categoria,
      nombre,
      nivel: detalles?.nivel ?? null,
      precio_racion: detalles?.precioRacion ?? null,
      precio_macro_gramo: detalles?.precioMacroGramo ?? null,
    })
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

export async function actualizarPrecioMacroGramo(
  supabase: SupabaseClient,
  id: string,
  precioMacroGramo: number
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .update({ precio_macro_gramo: precioMacroGramo })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OpcionMenu;
}

export async function actualizarPrecioRacion(
  supabase: SupabaseClient,
  id: string,
  precioRacion: number
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .update({ precio_racion: precioRacion })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OpcionMenu;
}
