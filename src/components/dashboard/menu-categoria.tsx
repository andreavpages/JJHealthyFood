"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { crearOpcionMenu, borrarOpcionMenu } from "@/controllers/dashboard-menu.actions";
import type { CategoriaMenu, OpcionMenu } from "@/models/types";

export function MenuCategoria({
  categoria,
  titulo,
  opciones,
}: {
  categoria: CategoriaMenu;
  titulo: string;
  opciones: OpcionMenu[];
}) {
  const [nuevo, setNuevo] = useState("");
  const [pending, startTransition] = useTransition();

  function agregar() {
    const nombre = nuevo.trim();
    if (!nombre) return;
    setNuevo("");
    startTransition(async () => {
      await crearOpcionMenu(categoria, nombre);
    });
  }

  function quitar(id: string) {
    startTransition(async () => {
      await borrarOpcionMenu(id);
    });
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6">
      <h3 className="font-display text-lg font-semibold text-on-surface mb-4">
        {titulo}
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {opciones.length === 0 && (
          <p className="text-sm text-on-surface-variant font-sans">
            Sin opciones todavía.
          </p>
        )}
        {opciones.map((o) => (
          <span
            key={o.id}
            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-primary/10 text-primary font-sans text-sm"
          >
            {o.nombre}
            <button
              type="button"
              onClick={() => quitar(o.id)}
              disabled={pending}
              title={`Quitar ${o.nombre}`}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors disabled:opacity-50"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") agregar();
          }}
          placeholder="Nueva opción..."
          disabled={pending}
          className="flex-1 h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={agregar}
          disabled={pending || !nuevo.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-40 active:scale-95 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
