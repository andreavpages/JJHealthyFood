import type { SupabaseClient } from "@supabase/supabase-js";
import type { Clienta, ClientaConPedidos, EstadoClienta } from "./types";

export async function crearClienta(
  supabase: SupabaseClient,
  datos: Pick<Clienta, "nombre" | "telefono"> &
    Partial<Pick<Clienta, "direccion" | "zona_entrega">>
): Promise<Clienta> {
  const { data, error } = await supabase
    .from("clientas")
    .insert(datos)
    .select()
    .single();

  if (error) throw error;
  return data as Clienta;
}

export async function buscarClientaPorTelefono(
  supabase: SupabaseClient,
  telefono: string
): Promise<Clienta | null> {
  const { data, error } = await supabase
    .from("clientas")
    .select("*")
    .eq("telefono", telefono)
    .maybeSingle();

  if (error) throw error;
  return data as Clienta | null;
}

export async function listarClientas(
  supabase: SupabaseClient
): Promise<Clienta[]> {
  const { data, error } = await supabase
    .from("clientas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Clienta[];
}

export async function listarClientasConPedidos(
  supabase: SupabaseClient
): Promise<ClientaConPedidos[]> {
  const { data, error } = await supabase
    .from("clientas")
    .select("*, pedidos(id, fecha_pedido)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as ClientaConPedidos[];
}

/**
 * Heurística de primera versión (sin columnas nuevas en `clientas`):
 * inactiva si nunca pidió o su último pedido fue hace más de 60 días,
 * nueva si se registró hace 14 días o menos, vip desde 10 pedidos,
 * y recurrente en cualquier otro caso. La dueña podrá ajustar estos
 * umbrales más adelante si no calzan con el negocio real.
 */
export function calcularEstadoClienta(clienta: ClientaConPedidos): EstadoClienta {
  const totalPedidos = clienta.pedidos.length;
  const ahora = Date.now();
  const diasDesdeCreacion =
    (ahora - new Date(clienta.created_at).getTime()) / 86_400_000;

  const fechaUltimoPedido = clienta.pedidos.reduce<string | null>(
    (masReciente, p) =>
      !masReciente || p.fecha_pedido > masReciente ? p.fecha_pedido : masReciente,
    null
  );
  const diasDesdeUltimoPedido = fechaUltimoPedido
    ? (ahora - new Date(fechaUltimoPedido).getTime()) / 86_400_000
    : null;

  if (totalPedidos === 0 || (diasDesdeUltimoPedido !== null && diasDesdeUltimoPedido > 60)) {
    return "inactivo";
  }
  if (diasDesdeCreacion <= 14) {
    return "nuevo";
  }
  if (totalPedidos >= 10) {
    return "vip";
  }
  return "recurrente";
}
