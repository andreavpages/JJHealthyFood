import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listarOpcionesMenu } from "@/models/menu.model";
import { listarSedesActivas } from "@/models/sedes.model";
import { PedidoWizard } from "@/components/pedido/pedido-wizard";

export const metadata: Metadata = {
  title: "Arma tu pedido — JJ Healthy Food",
};

export default async function PedidoPage() {
  const supabase = await createClient();
  const [opciones, sedes] = await Promise.all([
    listarOpcionesMenu(supabase),
    listarSedesActivas(supabase),
  ]);

  const proteinas = opciones.filter((o) => o.categoria === "proteina");
  const carbohidratos = opciones
    .filter((o) => o.categoria === "carbohidrato")
    .map((o) => o.nombre);
  const vegetales = opciones
    .filter((o) => o.categoria === "vegetal")
    .map((o) => o.nombre);
  const opcionesDesayuno = opciones
    .filter((o) => o.categoria === "desayuno");

  return (
    <PedidoWizard
      proteinas={proteinas}
      carbohidratos={carbohidratos}
      vegetales={vegetales}
      opcionesDesayuno={opcionesDesayuno}
      sedes={sedes}
    />
  );
}
