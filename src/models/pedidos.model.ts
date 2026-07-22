import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EstadoPedido,
  Pedido,
  PedidoConDetalle,
  PedidoParaComanda,
} from "./types";

export async function crearPedido(
  supabase: SupabaseClient,
  datos: Pick<Pedido, "clienta_id" | "dia_entrega" | "precio_total" | "modo"> &
    Partial<Pick<Pedido, "notas">>
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("pedidos")
    .insert(datos)
    .select()
    .single();

  if (error) throw error;
  return data as Pedido;
}

export async function listarPedidosRecientes(
  supabase: SupabaseClient,
  limite = 20
): Promise<{ pedidos: PedidoConDetalle[]; total: number }> {
  const { data, error, count } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, zona_entrega, direccion), comidas_pedido(proteina)",
      { count: "exact" }
    )
    .order("fecha_pedido", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return { pedidos: data as unknown as PedidoConDetalle[], total: count ?? 0 };
}

export async function contarPedidosPendientes(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente");

  if (error) throw error;
  return count ?? 0;
}

export async function contarPedidosEntregados(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "entregado");

  if (error) throw error;
  return count ?? 0;
}

export async function actualizarEstadoPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  estado: EstadoPedido
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", pedidoId)
    .select()
    .single();

  if (error) throw error;
  return data as Pedido;
}

export async function obtenerPedidoParaComanda(
  supabase: SupabaseClient,
  pedidoId: string
): Promise<PedidoParaComanda | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, direccion, zona_entrega), comidas_pedido(*)"
    )
    .eq("id", pedidoId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as PedidoParaComanda | null;
}

export async function listarPedidosPendientesParaComanda(
  supabase: SupabaseClient
): Promise<PedidoParaComanda[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, direccion, zona_entrega), comidas_pedido(*)"
    )
    .eq("estado", "pendiente")
    .order("fecha_pedido", { ascending: false });

  if (error) throw error;
  return data as unknown as PedidoParaComanda[];
}

export async function actualizarPrecioPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  precioTotal: number
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ precio_total: precioTotal })
    .eq("id", pedidoId)
    .select()
    .single();

  if (error) throw error;
  return data as Pedido;
}

export async function calcularIngresosDelMes(
  supabase: SupabaseClient
): Promise<number> {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("pedidos")
    .select("precio_total")
    .eq("estado", "entregado")
    .gte("fecha_pedido", inicioMes.toISOString());

  if (error) throw error;
  return data.reduce((total, p) => total + Number(p.precio_total), 0);
}

export async function listarPedidosPendientes(
  supabase: SupabaseClient
): Promise<{ id: string; clienta_nombre: string; dia_entrega: string; precio_total: number; fecha_pedido: string }[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, dia_entrega, precio_total, fecha_pedido, clientas(nombre)")
    .eq("estado", "pendiente")
    .order("fecha_pedido", { ascending: false })
    .limit(10);

  if (error) throw error;

  type FilaPedidoPendiente = {
    id: string;
    dia_entrega: string;
    precio_total: number;
    fecha_pedido: string;
    clientas: { nombre: string } | null;
  };

  return ((data ?? []) as unknown as FilaPedidoPendiente[]).map((p) => ({
    id: p.id,
    clienta_nombre: p.clientas?.nombre ?? "Sin nombre",
    dia_entrega: p.dia_entrega,
    precio_total: p.precio_total,
    fecha_pedido: p.fecha_pedido,
  }));
}
