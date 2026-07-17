import { createClient } from "@/lib/supabase/server";
import { listarOpcionesMenu } from "@/models/menu.model";
import { MenuCategoria } from "@/components/dashboard/menu-categoria";

export default async function MenuSemanalPage() {
  const supabase = await createClient();
  const opciones = await listarOpcionesMenu(supabase);

  const proteinas = opciones.filter((o) => o.categoria === "proteina");
  const carbohidratos = opciones.filter((o) => o.categoria === "carbohidrato");
  const desayuno = opciones.filter((o) => o.categoria === "desayuno");

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface mb-1">
          Menú Semanal
        </h2>
        <p className="font-sans text-on-surface-variant">
          Agrega o quita las opciones que ve la clienta al armar su pedido.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <MenuCategoria
          categoria="proteina"
          titulo="Proteínas"
          opciones={proteinas}
        />
        <MenuCategoria
          categoria="carbohidrato"
          titulo="Carbohidratos"
          opciones={carbohidratos}
        />
        <div className="md:col-span-2">
          <MenuCategoria
            categoria="desayuno"
            titulo="Opciones de desayuno"
            opciones={desayuno}
          />
        </div>
      </div>
    </div>
  );
}
