"use server";

import { createClient } from "@/lib/supabase/server";
import { crearPedido } from "@/models/pedidos.model";
import { crearComidasPedido } from "@/models/comidas-pedido.model";
import type { ComidaPedido, DiaEntrega } from "@/models/types";

export type DatosEntrega = {
  nombre: string;
  telefono: string;
  direccion: string;
  detalles: string;
  dia_entrega: DiaEntrega;
};

export type ComidaSeleccionada = Omit<ComidaPedido, "id" | "pedido_id">;

export type ClientaEncontrada = {
  nombre: string;
  direccion: string | null;
  zona_entrega: string | null;
};

export type ResultadoEnvioPedido =
  | { success: true; whatsappUrl: string }
  | { success: false; error: string };

export async function buscarClientaPorTelefono(
  telefono: string
): Promise<ClientaEncontrada | null> {
  if (!telefono.trim()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("buscar_clienta_por_telefono", { telefono_buscado: telefono })
    .maybeSingle();

  if (error || !data) return null;
  return data as ClientaEncontrada;
}

function construirMensajeWhatsapp(
  datos: DatosEntrega,
  comidas: ComidaSeleccionada[]
) {
  const lineas = comidas
    .map((c) =>
      c.es_desayuno
        ? `Desayuno: Waffles + ${c.proteina}${c.extra ? ` + ${c.extra}` : ""}`
        : `Comida ${c.numero_comida}: ${c.proteina} + ${c.carbohidrato}${c.extra ? ` + ${c.extra}` : ""}`
    )
    .join("\n");

  const diaLabel = datos.dia_entrega === "miercoles" ? "Miércoles" : "Jueves";

  return (
    `Hola JJ Healthy Food! Quiero hacer este pedido:\n\n${lineas}\n\n` +
    `Día de entrega: ${diaLabel}\n` +
    `Nombre: ${datos.nombre}\n` +
    `Dirección: ${datos.direccion}` +
    (datos.detalles ? `\nDetalles: ${datos.detalles}` : "")
  );
}

export async function enviarPedido(
  datosEntrega: DatosEntrega,
  comidas: ComidaSeleccionada[]
): Promise<ResultadoEnvioPedido> {
  if (comidas.length < 1 || comidas.length > 5) {
    return { success: false, error: "Elige entre 1 y 5 comidas." };
  }
  if (!datosEntrega.nombre.trim() || !datosEntrega.telefono.trim() || !datosEntrega.direccion.trim()) {
    return { success: false, error: "Faltan tus datos de entrega." };
  }

  const supabase = await createClient();

  const { data: clientaId, error: clientaError } = await supabase.rpc(
    "upsert_clienta_publica",
    {
      p_telefono: datosEntrega.telefono,
      p_nombre: datosEntrega.nombre,
      p_direccion: datosEntrega.direccion,
    }
  );

  if (clientaError || !clientaId) {
    return { success: false, error: "No se pudieron guardar tus datos. Intenta de nuevo." };
  }

  try {
    const pedido = await crearPedido(supabase, {
      clienta_id: clientaId as string,
      dia_entrega: datosEntrega.dia_entrega,
      precio_total: 0,
      notas: datosEntrega.detalles.trim() || undefined,
    });

    await crearComidasPedido(
      supabase,
      comidas.map((c) => ({ ...c, pedido_id: pedido.id }))
    );

    const numeroNegocio = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const mensaje = construirMensajeWhatsapp(datosEntrega, comidas);
    const whatsappUrl = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;

    return { success: true, whatsappUrl };
  } catch {
    return { success: false, error: "No se pudo crear el pedido. Intenta de nuevo." };
  }
}
