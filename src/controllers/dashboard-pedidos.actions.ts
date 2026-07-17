"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  actualizarEstadoPedido,
  actualizarPrecioPedido,
} from "@/models/pedidos.model";
import type { EstadoPedido } from "@/models/types";

export async function cambiarEstadoPedido(
  pedidoId: string,
  estado: EstadoPedido
) {
  const supabase = await createClient();
  await actualizarEstadoPedido(supabase, pedidoId, estado);
  revalidatePath("/dashboard");
}

export async function cambiarPrecioPedido(pedidoId: string, precio: number) {
  const supabase = await createClient();
  await actualizarPrecioPedido(supabase, pedidoId, precio);
  revalidatePath("/dashboard");
}
