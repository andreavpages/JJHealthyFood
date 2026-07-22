import { createClient } from "@/lib/supabase/server";
import { listarOpcionesMenu } from "@/models/menu.model";
import { MenuCategoria } from "@/components/dashboard/menu-categoria";
import { RecargarMenuButton } from "@/components/dashboard/recargar-menu-button";

export default async function MenuSemanalPage() {
  const supabase = await createClient();
  const opciones = await listarOpcionesMenu(supabase);

  const proteinas = opciones.filter((o) => o.categoria === "proteina");
  const carbohidratos = opciones.filter((o) => o.categoria === "carbohidrato");
  const vegetales = opciones.filter((o) => o.categoria === "vegetal");
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

      {opciones.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="font-sans text-sm text-amber-800 mb-3">
            El menú está vacío. Puedes cargar las opciones predeterminadas.
          </p>
          <RecargarMenuButton />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <MenuCategoria
          categoria="proteina"
          titulo="Proteínas"
          opciones={proteinas}
          esProteina
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <MenuCategoria
            categoria="carbohidrato"
            titulo="Carbohidratos"
            opciones={carbohidratos}
          />
          <MenuCategoria
            categoria="vegetal"
            titulo="Vegetales"
            opciones={vegetales}
          />
        </div>
        <MenuCategoria
          categoria="desayuno"
          titulo="Opciones de desayuno"
          opciones={desayuno}
        />
      </div>
    </div>
  );
}
