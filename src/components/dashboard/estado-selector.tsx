"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoPedido } from "@/controllers/dashboard-pedidos.actions";
import type { EstadoPedido } from "@/models/types";

const ESTADOS: EstadoPedido[] = ["pendiente", "en_preparacion", "entregado"];

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  entregado: "Entregado",
};

const ESTADO_BADGE: Record<EstadoPedido, string> = {
  pendiente: "bg-secondary-container/20 text-secondary",
  en_preparacion: "bg-primary/10 text-primary",
  entregado: "bg-on-surface-variant/10 text-on-surface-variant",
};

export function EstadoSelector({
  pedidoId,
  estadoInicial,
}: {
  pedidoId: string;
  estadoInicial: EstadoPedido;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [pending, startTransition] = useTransition();

  function cambiar(nuevo: EstadoPedido) {
    if (nuevo === estado) return;
    const anterior = estado;
    setEstado(nuevo);
    startTransition(async () => {
      try {
        await cambiarEstadoPedido(pedidoId, nuevo);
      } catch {
        setEstado(anterior);
      }
    });
  }

  return (
    <select
      value={estado}
      disabled={pending}
      onChange={(e) => cambiar(e.target.value as EstadoPedido)}
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight border-0 outline-none cursor-pointer disabled:opacity-60 ${ESTADO_BADGE[estado]}`}
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {ESTADO_LABEL[e]}
        </option>
      ))}
    </select>
  );
}
