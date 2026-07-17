import { createClient } from "@/lib/supabase/server";
import { listarClientasConPedidos } from "@/models/clientas.model";
import { ClientesTabla } from "@/components/dashboard/clientes-tabla";
import { Users, Zap } from "lucide-react";

function esHoy(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const hoy = new Date();
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
}

export default async function ClientesPage() {
  const supabase = await createClient();
  const clientas = await listarClientasConPedidos(supabase);

  const activasHoy = clientas.filter((c) =>
    c.pedidos.some((p) => esHoy(p.fecha_pedido))
  ).length;

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-[32px] font-semibold text-primary mb-1">
            Gestión de Clientes
          </h2>
          <p className="font-sans text-on-surface-variant">
            Supervisa tu base de clientas y su actividad reciente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-secondary font-sans text-xs font-bold uppercase tracking-wider">
              Total Clientas
            </span>
            <Users className="text-primary/40" size={20} />
          </div>
          <div className="font-display text-2xl font-semibold text-primary">
            {clientas.length}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-secondary font-sans text-xs font-bold uppercase tracking-wider">
              Activas Hoy
            </span>
            <Zap className="text-primary/40" size={20} />
          </div>
          <div className="font-display text-2xl font-semibold text-primary">
            {activasHoy}
          </div>
        </div>
      </div>

      <ClientesTabla clientas={clientas} />
    </div>
  );
}
