import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listarOpcionesMenu, listarExtrasConfig } from "@/models/menu.model";
import { listarSedesActivas } from "@/models/sedes.model";
import { PedidoWizard } from "@/components/pedido/pedido-wizard";

export const metadata: Metadata = {
  title: "Arma tu pedido — JJ Healthy Food",
};

export default async function PedidoPage() {
  const supabase = await createClient();
  const [opciones, sedes, extrasConfig] = await Promise.all([
    listarOpcionesMenu(supabase),
    listarSedesActivas(supabase),
    listarExtrasConfig(supabase),
  ]);

  const proteinas = opciones.filter((o) => o.categoria === "proteina");
  const carbohidratos = opciones
    .filter((o) => o.categoria === "carbohidrato" && !o.excluido_extra)
    .map((o) => o.nombre);
  const vegetales = opciones
    .filter((o) => o.categoria === "vegetal" && !o.excluido_extra)
    .map((o) => o.nombre);
  const opcionesDesayuno = opciones
    .filter((o) => o.categoria === "desayuno");
  const platos = opciones.filter((o) => o.categoria === "plato");

  return (
    <PedidoWizard
      proteinas={proteinas}
      carbohidratos={carbohidratos}
      vegetales={vegetales}
      opcionesDesayuno={opcionesDesayuno}
      sedes={sedes}
      extrasConfig={extrasConfig}
      platos={platos}
    />
  );
}
