import type { SupabaseClient } from "@supabase/supabase-js";
import type { ComidaPedido } from "./types";

export async function crearComidasPedido(
  supabase: SupabaseClient,
  comidas: Array<Omit<ComidaPedido, "id">>
): Promise<void> {
  // Igual que en crearPedido: el publico solo puede insertar, no leer,
  // asi que no se pide .select() de vuelta (Postgres RLS rechazaria el
  // INSERT ... RETURNING sin una politica de SELECT para anon).
  const { error } = await supabase.from("comidas_pedido").insert(comidas);

  if (error) {
    console.error("Error Supabase al insertar comidas:", JSON.stringify(error, null, 2));
    console.error("Datos que se intentaron insertar:", JSON.stringify(comidas, null, 2));
    throw error;
  }
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
