import { createClient } from "@/lib/supabase/server";
import { Settings, Lock } from "lucide-react";
import { CambiarClaveForm } from "@/components/dashboard/cambiar-clave-form";
import { WhatsappNumeroForm } from "@/components/dashboard/whatsapp-numero-form";
import { obtenerConfiguracion } from "@/models/configuracion.model";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const whatsappNumero =
    (await obtenerConfiguracion(supabase, "whatsapp_numero")) ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    "";

  return (
    <div className="max-w-[800px] mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface flex items-center gap-3">
          <Settings size={28} />
          Configuración
        </h2>
        <p className="font-sans text-on-surface-variant mt-1">
          Administra los ajustes del sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Datos del Negocio */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4">Datos del Negocio</h3>
          <div className="space-y-4">
            <div>
              <label className="font-sans text-sm font-medium text-on-surface">Nombre</label>
              <input
                type="text"
                defaultValue="JJ Healthy Food"
                className="mt-1 w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <WhatsappNumeroForm numeroActual={whatsappNumero} />
          </div>
        </div>

        {/* Días de Entrega */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4">Días de Entrega</h3>
          <p className="font-sans text-sm text-on-surface-variant mb-4">
            Los días en que se realizan entregas
          </p>
          <div className="flex flex-wrap gap-3">
            {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((dia) => (
              <label
                key={dia}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <input
                  type="checkbox"
                  defaultChecked={dia === "Domingo" || dia === "Lunes"}
                  className="w-4 h-4 accent-primary"
                />
                <span className="font-sans text-sm text-on-surface">{dia}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Información de Cuenta */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4">Cuenta</h3>
          <div className="space-y-2 mb-6">
            <p className="font-sans text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">Email:</span> {user?.email}
            </p>
            <p className="font-sans text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">ID:</span> {user?.id}
            </p>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Lock size={20} />
            Cambiar Contraseña
          </h3>
          <CambiarClaveForm />
        </div>

      </div>
    </div>
  );
}
