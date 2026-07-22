"use client";

import { useTransition } from "react";
import { recargarMenuCompleto } from "@/controllers/dashboard-menu.actions";
import { RefreshCw } from "lucide-react";

export function RecargarMenuButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => recargarMenuCompleto())}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-sans text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
    >
      <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
      {pending ? "Cargando..." : "Cargar menú predeterminado"}
    </button>
  );
}
