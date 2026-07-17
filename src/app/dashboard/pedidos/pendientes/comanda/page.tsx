import { createClient } from "@/lib/supabase/server";
import { listarPedidosPendientesParaComanda } from "@/models/pedidos.model";
import { BotonImprimirComanda } from "@/components/dashboard/boton-imprimir-comanda";
import { ComandaTicket } from "@/components/dashboard/comanda-ticket";
import { AutoPrint } from "@/components/dashboard/auto-print";

export default async function ComandasPendientesPage() {
  const supabase = await createClient();
  const pedidos = await listarPedidosPendientesParaComanda(supabase);

  return (
    <div className="min-h-screen bg-surface-container-low py-8 px-4 print:bg-white print:p-0">
      {pedidos.length > 0 && <AutoPrint />}
      <div className="max-w-sm mx-auto print:max-w-none">
        <div className="print:hidden mb-4 flex flex-col items-center gap-2">
          <p className="font-sans text-sm text-on-surface-variant">
            {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} pendiente
            {pedidos.length === 1 ? "" : "s"}
          </p>
          {pedidos.length > 0 && <BotonImprimirComanda />}
        </div>

        {pedidos.length === 0 ? (
          <p className="text-center text-on-surface-variant font-sans">
            No hay pedidos pendientes por imprimir.
          </p>
        ) : (
          <>
            <div className="space-y-6 print:space-y-0 print:grid print:grid-cols-2 print:gap-x-4 print:gap-y-4 print:items-start">
              {pedidos.map((pedido) => (
                <ComandaTicket key={pedido.id} pedido={pedido} />
              ))}
            </div>
            <p className="text-center font-sans text-xs text-on-surface-variant/60 print:text-black/40 mt-6">
              — sin más pedidos pendientes —
            </p>
          </>
        )}
      </div>
    </div>
  );
}
