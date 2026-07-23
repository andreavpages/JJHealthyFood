"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { guardarWhatsappNumero } from "@/controllers/dashboard-configuracion.actions";

export function WhatsappNumeroForm({ numeroActual }: { numeroActual: string }) {
  const [valor, setValor] = useState(numeroActual ? `+${numeroActual}` : "");
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await guardarWhatsappNumero(valor);
      setGuardado(true);
    });
  }

  return (
    <div>
      <label className="font-sans text-sm font-medium text-on-surface">
        WhatsApp
      </label>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setGuardado(false);
          }}
          placeholder="+14075550123"
          disabled={pending}
          className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={pending || !valor.trim()}
          className="px-4 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          {pending ? "..." : "Guardar"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-on-surface-variant font-sans flex items-center gap-1">
        {guardado ? (
          <>
            <Check size={13} className="text-primary" /> Guardado — ya aplica
            a los próximos pedidos.
          </>
        ) : (
          "Formato internacional, con o sin +, sin espacios (ej. +14075550123)."
        )}
      </p>
    </div>
  );
}
