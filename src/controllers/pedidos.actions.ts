"use server";

import { createClient } from "@/lib/supabase/server";
import { crearPedido } from "@/models/pedidos.model";
import { crearComidasPedido } from "@/models/comidas-pedido.model";
import type { ComidaPedido, DiaEntrega, ModoPedido } from "@/models/types";

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

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

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
  modo: ModoPedido,
  comidas: ComidaSeleccionada[],
  total: number
) {
  const lineas = comidas
    .map((c) => {
      const base = c.es_desayuno
        ? c.proteina
        : `${c.proteina} + ${c.carbohidrato}${c.vegetal ? ` + ${c.vegetal}` : ""}`;
      const extra = c.extra ? ` + extra: ${c.extra}` : "";
      const gramos =
        modo === "macro" && !c.es_desayuno && c.gramos_proteina !== null
          ? ` (${c.gramos_proteina}g / ${c.gramos_carbohidrato}g)`
          : "";
      return `*Meal ${c.numero_comida}:* ${base}${extra}${gramos} — ${formatearMoneda(c.precio)}`;
    })
    .join("\n");

  const diaLabel = datos.dia_entrega === "domingo" ? "Sunday" : "Monday";
  const modoLabel = modo === "macro" ? "Macro" : "By Portion";

  return (
    `Hi JJ Healthy Food! I'd like to place this order (${modoLabel}):\n\n${lineas}\n\n` +
    `*Estimated total: ${formatearMoneda(total)}*\n\n` +
    `*Delivery day:* ${diaLabel}\n` +
    `*Name:* ${datos.nombre}\n` +
    `*Address:* ${datos.direccion}` +
    (datos.detalles ? `\n*Details:* ${datos.detalles}` : "")
  );
}

export async function enviarPedido(
  datosEntrega: DatosEntrega,
  modo: ModoPedido,
  comidas: ComidaSeleccionada[]
): Promise<ResultadoEnvioPedido> {
  console.log("=== INICIO ENVIAR PEDIDO ===");
  console.log("Datos entrega:", datosEntrega);
  console.log("Modo:", modo);
  console.log("Comidas:", comidas.length);

  if (comidas.length < 1) {
    console.log("Error: No hay comidas");
    return { success: false, error: "Choose at least one meal." };
  }
  if (!datosEntrega.nombre.trim() || !datosEntrega.telefono.trim() || !datosEntrega.direccion.trim()) {
    console.log("Error: Faltan datos");
    return { success: false, error: "Your delivery details are missing." };
  }

  const supabase = await createClient();

  console.log("Intentando upsert clienta...");
  const { data: clientaId, error: clientaError } = await supabase.rpc(
    "upsert_clienta_publica",
    {
      p_telefono: datosEntrega.telefono,
      p_nombre: datosEntrega.nombre,
      p_direccion: datosEntrega.direccion,
    }
  );

  console.log("Resultado upsert:", { clientaId, clientaError });

  if (clientaError || !clientaId) {
    console.log("Error en upsert:", clientaError);
    return { success: false, error: "We couldn't save your details. Please try again." };
  }

  try {
    const total = comidas.reduce((suma, c) => suma + c.precio, 0);
    console.log("Total:", total);

    console.log("Creando pedido...");
    const pedido = await crearPedido(supabase, {
      clienta_id: clientaId as string,
      dia_entrega: datosEntrega.dia_entrega,
      modo,
      precio_total: total,
      notas: datosEntrega.detalles.trim() || undefined,
    });

    console.log("Pedido creado:", pedido.id);

    console.log("Creando comidas...");
    await crearComidasPedido(
      supabase,
      comidas.map((c) => ({ ...c, pedido_id: pedido.id }))
    );

    console.log("Comidas creadas OK");

    const numeroNegocio = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const mensaje = construirMensajeWhatsapp(datosEntrega, modo, comidas, total);
    const whatsappUrl = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;

    console.log("=== PEDIDO COMPLETADO ===");
    return { success: true, whatsappUrl };
  } catch (e) {
    console.error("=== ERROR AL CREAR PEDIDO ===");
    console.error("Error:", e);
    return { success: false, error: "We couldn't create your order. Please try again." };
  }
}
