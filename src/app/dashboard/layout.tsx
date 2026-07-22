import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listarPedidosPendientes } from "@/models/pedidos.model";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pedidosPendientes = await listarPedidosPendientes(supabase);

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <Sidebar />
        <Topbar adminEmail={user.email ?? ""} pedidosPendientes={pedidosPendientes} />
        <BottomNav />
      </div>
      <main className="md:ml-[280px] md:pt-16 pb-24 md:pb-8 print:ml-0 print:pt-0 print:pb-0">{children}</main>
    </div>
  );
}
