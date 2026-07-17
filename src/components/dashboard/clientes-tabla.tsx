"use client";

import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { calcularEstadoClienta } from "@/models/clientas.model";
import type { ClientaConPedidos, EstadoClienta } from "@/models/types";

const ESTADO_LABEL: Record<EstadoClienta, string> = {
  vip: "VIP",
  recurrente: "Recurrente",
  nuevo: "Nuevo",
  inactivo: "Inactivo",
};

const ESTADO_BADGE: Record<EstadoClienta, string> = {
  vip: "bg-primary text-on-primary",
  recurrente: "bg-primary/10 text-primary",
  nuevo: "bg-secondary/10 text-secondary",
  inactivo: "bg-tertiary-container/20 text-tertiary",
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function AccionesBoton() {
  return (
    <button
      type="button"
      disabled
      title="Editar/gestionar clienta — próximamente"
      className="p-2 text-on-surface-variant/40 cursor-not-allowed"
    >
      <MoreVertical size={18} />
    </button>
  );
}

export function ClientesTabla({
  clientas,
}: {
  clientas: ClientaConPedidos[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = clientas.filter((c) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      c.nombre.toLowerCase().includes(termino) ||
      c.telefono.toLowerCase().includes(termino)
    );
  });

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
      <div className="p-4 md:p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <h3 className="font-sans text-sm font-semibold text-primary">
          Base de Datos de Clientas
        </h3>
        <div className="relative w-full md:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full h-10 pl-9 pr-3 bg-surface-container-low border border-outline-variant rounded-full text-sm font-sans focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="p-10 text-center text-on-surface-variant font-sans">
          {clientas.length === 0
            ? "Aún no hay clientas registradas."
            : "Ninguna clienta coincide con esa búsqueda."}
        </div>
      ) : (
        <>
          {/* Tabla (escritorio) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 font-sans text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant">
                    Clienta
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant">
                    Contacto
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant text-center">
                    Pedidos
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtradas.map((clienta) => {
                  const estado = calcularEstadoClienta(clienta);
                  return (
                    <tr
                      key={clienta.id}
                      className="hover:bg-surface-container-low/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary border border-outline-variant">
                            {iniciales(clienta.nombre)}
                          </div>
                          <div>
                            <div className="font-sans text-sm font-semibold text-primary">
                              {clienta.nombre}
                            </div>
                            <div className="text-on-surface-variant text-xs">
                              ID: {clienta.id.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-sans text-sm text-on-surface">
                          {clienta.telefono}
                        </div>
                        {clienta.zona_entrega && (
                          <div className="text-on-surface-variant text-xs">
                            {clienta.zona_entrega}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-display text-lg text-primary/80">
                          {clienta.pedidos.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-sans text-xs font-semibold ${ESTADO_BADGE[estado]}`}
                        >
                          {ESTADO_LABEL[estado]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AccionesBoton />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas (movil) */}
          <div className="md:hidden divide-y divide-outline-variant/40">
            {filtradas.map((clienta) => {
              const estado = calcularEstadoClienta(clienta);
              return (
                <div
                  key={clienta.id}
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 shrink-0 bg-surface-container rounded-full flex items-center justify-center font-bold text-primary border border-outline-variant">
                      {iniciales(clienta.nombre)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-sm font-semibold text-on-surface truncate">
                        {clienta.nombre}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {clienta.telefono}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold ${ESTADO_BADGE[estado]}`}
                        >
                          {ESTADO_LABEL[estado]}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {clienta.pedidos.length} pedidos
                        </span>
                      </div>
                    </div>
                  </div>
                  <AccionesBoton />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="px-4 md:px-6 py-4 bg-surface-container-low/40 flex justify-between items-center">
        <span className="font-sans text-xs text-on-surface-variant">
          Mostrando {filtradas.length} de {clientas.length} clientas
        </span>
      </div>
    </section>
  );
}
