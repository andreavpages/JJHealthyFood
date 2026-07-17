import type { SupabaseClient } from "@supabase/supabase-js";
import type { ComidaPedido } from "./types";

export async function crearComidasPedido(
  supabase: SupabaseClient,
  comidas: Array<Omit<ComidaPedido, "id">>
): Promise<ComidaPedido[]> {
  const { data, error } = await supabase
    .from("comidas_pedido")
    .insert(comidas)
    .select();

  if (error) throw error;
  return data as ComidaPedido[];
}

export async function listarComidasPorPedido(
  supabase: SupabaseClient,
  pedidoId: string
): Promise<ComidaPedido[]> {
  const { data, error } = await supabase
    .from("comidas_pedido")
    .select("*")
    .eq("pedido_id", pedidoId)
    .order("numero_comida", { ascending: true });

  if (error) throw error;
  return data as ComidaPedido[];
}
