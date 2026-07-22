"use client";

import { useTransition } from "react";
import { actualizarPreciosExistentes } from "@/controllers/dashboard-menu.actions";
import { DollarSign } from "lucide-react";

export function ActualizarPreciosButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => actualizarPreciosExistentes())}
      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-xl font-sans text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
    >
      <DollarSign size={16} />
      {pending ? "Actualizando..." : "Actualizar precios ($9/$12 sencilla, $12/$14 premium)"}
    </button>
  );
}
