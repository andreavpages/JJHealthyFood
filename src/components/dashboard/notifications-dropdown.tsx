"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

interface PedidoNotificacion {
  id: string;
  clienta_nombre: string;
  dia_entrega: string;
  precio_total: number;
  fecha_pedido: string;
}

export function NotificationsDropdown({ pedidosIniciales }: { pedidosIniciales: PedidoNotificacion[] }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = pedidosIniciales.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative"
      >
        <Bell size={20} />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-12 w-80 bg-surface rounded-xl shadow-xl border border-outline-variant z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
            <h3 className="font-sans text-sm font-semibold text-on-surface">Notificaciones</h3>
            <button type="button" onClick={() => setAbierto(false)} className="text-on-surface-variant hover:text-on-surface">
              <X size={16} />
            </button>
          </div>
          
          {total === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-sans text-sm text-on-surface-variant">No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {pedidosIniciales.map((pedido) => (
                <Link
                  key={pedido.id}
                  href={`/dashboard/pedidos/${pedido.id}`}
                  onClick={() => setAbierto(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors border-b border-outline-variant last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                    {pedido.clienta_nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-on-surface truncate">
                      {pedido.clienta_nombre}
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant">
                      {pedido.dia_entrega} · ${pedido.precio_total}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {total > 0 && (
            <div className="px-4 py-2 border-t border-outline-variant">
              <Link
                href="/dashboard"
                onClick={() => setAbierto(false)}
                className="block text-center font-sans text-sm text-primary hover:underline"
              >
                Ver todos los pendientes
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
