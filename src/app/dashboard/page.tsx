import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  calcularIngresosDelMes,
  contarPedidosEntregados,
  contarPedidosPendientes,
  listarPedidosRecientes,
} from "@/models/pedidos.model";
import { PedidosRecientes } from "@/components/dashboard/pedidos-recientes";
import { Wallet, Hourglass, Truck, Printer } from "lucide-react";

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

export default async function PedidosPage() {
  const supabase = await createClient();

  const [ingresosMes, pendientes, entregados, { pedidos, total }] =
    await Promise.all([
      calcularIngresosDelMes(supabase),
      contarPedidosPendientes(supabase),
      contarPedidosEntregados(supabase),
      listarPedidosRecientes(supabase),
    ]);

  const hoy = new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface">
            Panel de Pedidos
          </h2>
          <p className="font-sans text-on-surface-variant capitalize">
            {hoy} · {total} pedidos en total
          </p>
        </div>
        <Link
          href="/dashboard/pedidos/pendientes/comanda"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-sans text-sm font-semibold active:scale-95 transition-all"
        >
          <Printer size={18} />
          Imprimir pendientes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8">
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-start">
          <div>
            <p className="font-sans text-xs font-bold text-secondary uppercase tracking-wider mb-2">
              Ingresos Mensuales
            </p>
            <h3 className="font-display text-3xl md:text-4xl font-semibold text-primary">
              {formatearMoneda(ingresosMes)}
            </h3>
          </div>
          <div className="bg-primary/10 p-3 rounded-xl">
            <Wallet className="text-primary" size={28} />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 md:gap-6">
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-1">
                Pedidos Pendientes
              </p>
              <h4 className="font-display text-2xl font-semibold text-on-surface">
                {pendientes}
              </h4>
            </div>
            <div className="bg-secondary-fixed-dim/30 text-secondary p-4 rounded-full">
              <Hourglass size={22} />
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-1">
                Entregados
              </p>
              <h4 className="font-display text-2xl font-semibold text-on-surface">
                {entregados}
              </h4>
            </div>
            <div className="bg-tertiary-container/20 text-tertiary p-4 rounded-full">
              <Truck size={22} />
            </div>
          </div>
        </div>
      </div>

      <PedidosRecientes pedidos={pedidos} total={total} />
    </div>
  );
}
