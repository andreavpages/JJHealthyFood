"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { cambiarPrecioPedido } from "@/controllers/dashboard-pedidos.actions";

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function PrecioEditor({
  pedidoId,
  precioInicial,
}: {
  pedidoId: string;
  precioInicial: number;
}) {
  const [precio, setPrecio] = useState(precioInicial);
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(String(precioInicial));
  const [pending, startTransition] = useTransition();

  function guardar() {
    const nuevo = Number(valor);
    if (Number.isNaN(nuevo) || nuevo < 0) {
      setValor(String(precio));
      setEditando(false);
      return;
    }
    setEditando(false);
    if (nuevo === precio) return;

    const anterior = precio;
    setPrecio(nuevo);
    startTransition(async () => {
      try {
        await cambiarPrecioPedido(pedidoId, nuevo);
      } catch {
        setPrecio(anterior);
        setValor(String(anterior));
      }
    });
  }

  if (editando) {
    return (
      <input
        type="number"
        min={0}
        step="0.01"
        autoFocus
        value={valor}
        disabled={pending}
        onChange={(e) => setValor(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setValor(String(precio));
            setEditando(false);
          }
        }}
        className="w-24 px-2 py-1 rounded-lg border border-primary font-sans text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      className="inline-flex items-center gap-1.5 font-sans text-sm text-on-surface hover:text-primary transition-colors"
      title="Editar precio"
    >
      {formatearMoneda(precio)}
      <Pencil size={13} className="opacity-50" />
    </button>
  );
}
