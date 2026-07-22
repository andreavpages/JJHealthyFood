import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerPedidoParaComanda } from "@/models/pedidos.model";
import { BotonImprimirComanda } from "@/components/dashboard/boton-imprimir-comanda";
import { ComandaTicket } from "@/components/dashboard/comanda-ticket";
import { AutoPrint } from "@/components/dashboard/auto-print";

export default async function ComandaPage(
  props: PageProps<"/dashboard/pedidos/[id]/comanda">
) {
  const { id } = await props.params;

  const supabase = await createClient();
  const pedido = await obtenerPedidoParaComanda(supabase, id);

  if (!pedido) notFound();

  return (
    <div className="min-h-screen bg-surface-container-low py-8 px-4 print:bg-white print:p-0">
      <AutoPrint />
      <div className="max-w-sm mx-auto print:max-w-full">
        <div className="print:hidden mb-4 flex justify-center">
          <BotonImprimirComanda />
        </div>
        <ComandaTicket pedido={pedido} showSeparator={true} />
      </div>
    </div>
  );
}
