"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, MapPin } from "lucide-react";
import {
  agregarSede,
  guardarSede,
  alternarSedeActiva,
  borrarSede,
} from "@/controllers/dashboard-sedes.actions";
import type { SedeRetiro } from "@/models/types";

function SedeCard({
  sede,
  esUltimaActiva,
}: {
  sede: SedeRetiro;
  esUltimaActiva: boolean;
}) {
  const [nombre, setNombre] = useState(sede.nombre);
  const [direccion, setDireccion] = useState(sede.direccion);
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await guardarSede(sede.id, nombre, direccion);
      setGuardado(true);
    });
  }

  function alternarActiva() {
    startTransition(async () => {
      await alternarSedeActiva(sede.id, !sede.activa);
    });
  }

  function borrar() {
    if (!confirm(`¿Borrar la sede "${sede.nombre}"?`)) return;
    startTransition(async () => {
      await borrarSede(sede.id);
    });
  }

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        sede.activa
          ? "border-primary bg-primary/5"
          : "border-outline-variant"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
            sede.activa ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <MapPin size={14} />
          {sede.activa ? "Habilitada para clientes" : "Deshabilitada"}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={alternarActiva}
            disabled={pending || (sede.activa && esUltimaActiva)}
            title={
              sede.activa && esUltimaActiva
                ? "Tiene que quedar al menos una sede habilitada"
                : undefined
            }
            className="text-xs font-sans font-semibold text-primary hover:underline disabled:opacity-40 disabled:no-underline"
          >
            {sede.activa ? "Deshabilitar" : "Habilitar"}
          </button>
          <button
            type="button"
            onClick={borrar}
            disabled={pending || (sede.activa && esUltimaActiva)}
            title={
              sede.activa && esUltimaActiva
                ? "Tiene que quedar al menos una sede habilitada"
                : "Borrar sede"
            }
            className="text-on-surface-variant hover:text-error disabled:opacity-30 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <input
        type="text"
        value={nombre}
        onChange={(e) => {
          setNombre(e.target.value);
          setGuardado(false);
        }}
        placeholder="Nombre de la sede"
        disabled={pending}
        className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2 font-sans text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
      />
      <textarea
        value={direccion}
        onChange={(e) => {
          setDireccion(e.target.value);
          setGuardado(false);
        }}
        rows={2}
        placeholder="Dirección completa"
        disabled={pending}
        className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2 font-sans text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none resize-none"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={pending || !nombre.trim() || !direccion.trim()}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-sans text-xs font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          {pending ? "..." : "Guardar"}
        </button>
        {guardado && (
          <span className="text-xs text-primary font-sans flex items-center gap-1">
            <Check size={12} /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}

export function SedesRetiroPanel({ sedes }: { sedes: SedeRetiro[] }) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [pending, startTransition] = useTransition();

  function agregar() {
    if (!nuevoNombre.trim() || !nuevaDireccion.trim()) return;
    startTransition(async () => {
      await agregarSede(nuevoNombre, nuevaDireccion);
      setNuevoNombre("");
      setNuevaDireccion("");
    });
  }

  return (
    <div className="space-y-4">
      {sedes.length === 0 && (
        <p className="text-sm text-on-surface-variant font-sans italic">
          Todavía no hay sedes cargadas.
        </p>
      )}
      {sedes.map((sede) => (
        <SedeCard
          key={sede.id}
          sede={sede}
          esUltimaActiva={sedes.filter((s) => s.activa).length <= 1}
        />
      ))}

      <div className="border-t border-outline-variant/50 pt-4 space-y-3">
        <p className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Agregar otra sede
        </p>
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre (ej. Sede Norte)"
          disabled={pending}
          className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2 font-sans text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
        />
        <textarea
          value={nuevaDireccion}
          onChange={(e) => setNuevaDireccion(e.target.value)}
          rows={2}
          placeholder="Dirección completa"
          disabled={pending}
          className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2 font-sans text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none resize-none"
        />
        <button
          type="button"
          onClick={agregar}
          disabled={pending || !nuevoNombre.trim() || !nuevaDireccion.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-sans text-xs font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          <Plus size={14} />
          Agregar sede
        </button>
      </div>
    </div>
  );
}
