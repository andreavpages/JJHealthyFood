"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ChevronLeft,
  MapPin,
  Send,
  Clock,
  Leaf,
  Store,
  Minus,
  Plus,
  Pencil,
} from "lucide-react";
import { Chip } from "./chip";
import {
  buscarClientaPorTelefono,
  enviarPedido,
  type ComidaSeleccionada,
  type DatosEntrega,
} from "@/controllers/pedidos.actions";
import type { DiaEntrega, ModoPedido, OpcionMenu, SedeRetiro } from "@/models/types";

const TELEFONO_US_REGEX = /^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

type TipoComida = "regular" | "desayuno";

type ComidaSlot = {
  tipo: TipoComida;
  proteinaId: string;
  carbohidrato: string;
  vegetal: string;
  cantidad: number;
  gramosProteina: number;
  gramosCarbohidrato: number;
  extraActivo: boolean;
  extraValor: string;
};

const comidaVacia: ComidaSlot = {
  tipo: "regular",
  proteinaId: "",
  carbohidrato: "",
  vegetal: "",
  cantidad: 1,
  gramosProteina: 100,
  gramosCarbohidrato: 100,
  extraActivo: false,
  extraValor: "",
};

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

function proximaFecha(diaSemana: number): Date {
  const hoy = new Date();
  const diff = (diaSemana - hoy.getDay() + 7) % 7;
  const resultado = new Date(hoy);
  resultado.setDate(hoy.getDate() + diff);
  return resultado;
}

function etiquetaFecha(fecha: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(fecha);
}

const PRECIOS_MACRO: Record<string, number> = {
  sencilla: 12,
  premium: 14,
};

function precioComida(
  slot: ComidaSlot,
  modo: ModoPedido,
  proteinas: OpcionMenu[],
  opcionesDesayuno: OpcionMenu[]
): number {
  if (slot.tipo === "desayuno") {
    const desayuno = opcionesDesayuno.find((d) => d.nombre === slot.proteinaId);
    if (!desayuno) return 0;
    const precioBD = Number(desayuno.precio_racion);
    if (!isNaN(precioBD) && precioBD > 0) return precioBD;
    return 0;
  }
  const proteina = proteinas.find((p) => p.id === slot.proteinaId);
  if (!proteina) return 0;
  let base = 0;
  if (modo === "macro") {
    const precioBD = Number(proteina.precio_macro_gramo);
    if (!isNaN(precioBD) && precioBD > 0) base = precioBD;
    else {
      const fallback = proteina.nivel ? PRECIOS_MACRO[proteina.nivel] : undefined;
      base = fallback ?? 0;
    }
  } else {
    const precioBD = Number(proteina.precio_racion);
    if (!isNaN(precioBD) && precioBD > 0) base = precioBD;
  }

  let extra = 0;
  if (slot.extraActivo && slot.extraValor) {
    const extraEsProteina = proteinas.some((p) => p.nombre === slot.extraValor);
    if (extraEsProteina) {
      const nivel = proteinas.find((p) => p.nombre === slot.extraValor)?.nivel;
      extra = nivel === "premium" ? 2 : 1;
    } else {
      extra = 0.5;
    }
  }

  return base + extra;
}

function etiquetaPaso(paso: number, cantidad: number) {
  if (paso === 0) return "Quantity";
  if (paso === 1) return "Mode";
  if (paso <= cantidad + 1) return `Meal ${paso - 1}`;
  if (paso === cantidad + 2) return "Pickup";
  return "Summary";
}

export function PedidoWizard({
  proteinas,
  carbohidratos,
  vegetales,
  opcionesDesayuno,
  sedes,
}: {
  proteinas: OpcionMenu[];
  carbohidratos: string[];
  vegetales: string[];
  opcionesDesayuno: OpcionMenu[];
  sedes: SedeRetiro[];
}) {
  const [iniciado, setIniciado] = useState(false);
  const [paso, setPaso] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [modo, setModo] = useState<ModoPedido>("racion");
  const [comidas, setComidas] = useState<ComidaSlot[]>([{ ...comidaVacia }]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [detalles, setDetalles] = useState("");
  const [sedeId, setSedeId] = useState(() =>
    sedes.length === 1 ? sedes[0].id : ""
  );
  const [diaEntrega, setDiaEntrega] = useState<DiaEntrega | "">("");
  const [bienvenidaClienta, setBienvenidaClienta] = useState<string | null>(
    null
  );
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [resumenVisitado, setResumenVisitado] = useState(false);

  const totalPasos = cantidad + 4; // cantidad + modo + N comidas + entrega + resumen
  const esPasoCantidad = paso === 0;
  const esPasoModo = paso === 1;
  const esPasoComida = paso >= 2 && paso <= cantidad + 1;
  const esPasoEntrega = paso === cantidad + 2;
  const esPasoResumen = paso === cantidad + 3;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [paso]);

  function cambiarCantidad(nueva: number) {
    const limitada = Math.max(1, nueva);
    setCantidad(limitada);
    setComidas((prev) => {
      const copia = [...prev];
      while (copia.length < limitada) copia.push({ ...comidaVacia });
      return copia.slice(0, Math.max(limitada, copia.length));
    });
    setResumenVisitado(false);
  }

  function cambiarModo(nuevoModo: ModoPedido) {
    setModo(nuevoModo);
    setResumenVisitado(false);
  }

  function actualizarComida(indice: number, cambios: Partial<ComidaSlot>) {
    setComidas((prev) =>
      prev.map((c, i) => (i === indice ? { ...c, ...cambios } : c))
    );
  }

  async function alSalirDeTelefono() {
    if (!telefono.trim()) return;
    const encontrada = await buscarClientaPorTelefono(telefono.trim());
    if (encontrada) {
      setBienvenidaClienta(encontrada.nombre);
      if (!nombre) setNombre(encontrada.nombre);
    }
  }

  function puedeAvanzar() {
    if (esPasoCantidad || esPasoModo) return true;
    if (esPasoComida) {
      const c = comidas[paso - 2];
      if (c.tipo === "desayuno") return Boolean(c.proteinaId);
      return Boolean(c.proteinaId && c.carbohidrato);
    }
    if (esPasoEntrega) {
      return Boolean(
        nombre.trim() &&
          telefono.trim() &&
          TELEFONO_US_REGEX.test(telefono.trim()) &&
          sedeId &&
          diaEntrega
      );
    }
    return true;
  }

  function siguiente() {
    if (!puedeAvanzar()) return;
    if (resumenVisitado) {
      setPaso(totalPasos - 1);
      return;
    }
    const nuevo = Math.min(paso + 1, totalPasos - 1);
    setPaso(nuevo);
    if (nuevo === totalPasos - 1) setResumenVisitado(true);
  }

  function atras() {
    setPaso((p) => Math.max(p - 1, 0));
  }

  const comidasActivas = comidas.slice(0, cantidad);
  const total = comidasActivas.reduce(
    (suma, c) => suma + precioComida(c, modo, proteinas, opcionesDesayuno),
    0
  );

  function enviar() {
    if (!diaEntrega || !sedeId) return;
    setError(null);

    // Open the tab right away (synchronously, inside the click) so the
    // browser doesn't block it as a popup; the real WhatsApp URL is
    // assigned once the server responds.
    const ventana = window.open("", "_blank");

    const datosEntrega: DatosEntrega = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      detalles: detalles.trim(),
      dia_entrega: diaEntrega,
      sede_id: sedeId,
    };

    const comidasSeleccionadas: ComidaSeleccionada[] = comidasActivas.map(
      (c, i) => {
        const proteina = proteinas.find((p) => p.id === c.proteinaId);
        return {
          numero_comida: i + 1,
          proteina: c.tipo === "desayuno" ? c.carbohidrato : proteina?.nombre ?? "",
          carbohidrato: c.tipo === "desayuno" ? "" : c.carbohidrato,
          vegetal: c.tipo === "desayuno" ? null : c.vegetal || null,
          extra: c.extraActivo && c.extraValor ? c.extraValor : null,
          gramos_proteina:
            modo === "macro" && c.tipo !== "desayuno" ? c.gramosProteina : null,
          gramos_carbohidrato:
            modo === "macro" && c.tipo !== "desayuno" ? c.gramosCarbohidrato : null,
          precio: precioComida(c, modo, proteinas, opcionesDesayuno),
          es_desayuno: c.tipo === "desayuno",
        };
      }
    );

    startTransition(async () => {
      const resultado = await enviarPedido(datosEntrega, modo, comidasSeleccionadas);
      if (resultado.success) {
        setEnviado(true);
        if (ventana) {
          ventana.location.href = resultado.whatsappUrl;
        } else {
          window.location.href = resultado.whatsappUrl;
        }
      } else {
        ventana?.close();
        setError(resultado.error);
      }
    });
  }

  if (!iniciado) {
    return <IntroScreen onComenzar={() => setIniciado(true)} />;
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center gap-3 px-4 h-16 border-b border-outline-variant/40">
        <a href="/pedido" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JJ Healthy Food" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="font-display text-base font-semibold text-primary leading-none">
              JJ Healthy Food
            </h1>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-widest mt-0.5">
              Build Your Order
            </p>
          </div>
        </a>
      </header>

      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-sans font-semibold text-on-surface-variant">
            Step {paso + 1} of {totalPasos} · {etiquetaPaso(paso, cantidad)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((paso + 1) / totalPasos) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg w-full mx-auto">
        {esPasoCantidad && (
          <PasoCantidad cantidad={cantidad} onCambiar={cambiarCantidad} />
        )}

        {esPasoModo && <PasoModo modo={modo} onCambiar={cambiarModo} />}

        {esPasoComida && (
          <PasoComida
            numero={paso - 1}
            comida={comidas[paso - 2]}
            modo={modo}
            proteinas={proteinas}
            carbohidratos={carbohidratos}
            vegetales={vegetales}
            opcionesDesayuno={opcionesDesayuno}
            onCambiar={(cambios) => actualizarComida(paso - 2, cambios)}
          />
        )}

        {esPasoEntrega && (
          <PasoEntrega
            nombre={nombre}
            telefono={telefono}
            detalles={detalles}
            diaEntrega={diaEntrega}
            bienvenidaClienta={bienvenidaClienta}
            sedes={sedes}
            sedeId={sedeId}
            onNombreChange={setNombre}
            onTelefonoChange={setTelefono}
            onTelefonoBlur={alSalirDeTelefono}
            onDetallesChange={setDetalles}
            onDiaChange={setDiaEntrega}
            onSedeChange={setSedeId}
          />
        )}

        {esPasoResumen && (
          <PasoResumen
            comidas={comidasActivas}
            modo={modo}
            proteinas={proteinas}
            opcionesDesayuno={opcionesDesayuno}
            nombre={nombre}
            detalles={detalles}
            diaEntrega={diaEntrega}
            sede={sedes.find((s) => s.id === sedeId) ?? null}
            total={total}
            onEditarPaso={setPaso}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-error font-sans" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant/40 px-4 py-4 flex items-center gap-3">
        {paso > 0 && !enviado && (
          <button
            type="button"
            onClick={atras}
            className="flex items-center gap-1 px-4 py-3 text-on-surface-variant font-sans text-sm font-semibold"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        {!esPasoResumen ? (
          <button
            type="button"
            onClick={siguiente}
            disabled={!puedeAvanzar()}
            className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
          >
            {resumenVisitado ? "Back to summary" : "Next"}
          </button>
        ) : (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || enviado}
            className="flex-1 bg-secondary text-on-secondary py-3 rounded-2xl font-sans text-sm font-semibold disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {enviando
              ? "Sending..."
              : enviado
                ? "Done! Check the WhatsApp tab"
                : "Send order via WhatsApp"}
          </button>
        )}
      </div>
    </main>
  );
}

function PasoCantidad({
  cantidad,
  onCambiar,
}: {
  cantidad: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          How many meals do you want?
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Choose how many meals for this order.
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onCambiar(cantidad - 1)}
          disabled={cantidad <= 1}
          className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
        >
          <Minus size={20} />
        </button>
        <span className="font-display text-4xl font-semibold text-primary w-16 text-center">
          {cantidad}
        </span>
        <button
          type="button"
          onClick={() => onCambiar(cantidad + 1)}
          className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

function PasoModo({
  modo,
  onCambiar,
}: {
  modo: ModoPedido;
  onCambiar: (m: ModoPedido) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          How do you want your meals?
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          This applies to every meal in this order.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onCambiar("racion")}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
            modo === "racion"
              ? "border-primary bg-primary/10"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <p className="font-sans font-semibold text-on-surface">By Portion</p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Standard portion of protein, carb, and veggie.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onCambiar("macro")}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
            modo === "macro"
              ? "border-primary bg-primary/10"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <p className="font-sans font-semibold text-on-surface">Macro</p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Adjustable protein amount for your macros.
          </p>
        </button>
      </div>
    </div>
  );
}

function PasoComida({
  numero,
  comida,
  modo,
  proteinas,
  carbohidratos,
  vegetales,
  opcionesDesayuno,
  onCambiar,
}: {
  numero: number;
  comida: ComidaSlot;
  modo: ModoPedido;
  proteinas: OpcionMenu[];
  carbohidratos: string[];
  vegetales: string[];
  opcionesDesayuno: OpcionMenu[];
  onCambiar: (cambios: Partial<ComidaSlot>) => void;
}) {
  const esDesayuno = comida.tipo === "desayuno";
  const sencillas = proteinas.filter((p) => p.nivel === "sencilla");
  const premium = proteinas.filter((p) => p.nivel === "premium");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Meal {numero}
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Choose the meal type, then build your ingredients.
        </p>
      </div>

      <div>
        <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-3">
          Meal type
        </p>
        <div className="flex gap-2">
          <Chip
            label={modo === "macro" ? "Macro meal" : "Regular meal"}
            selected={comida.tipo === "regular"}
            onClick={() => onCambiar({ tipo: "regular", proteinaId: "" })}
          />
          <Chip
            label="Breakfast"
            selected={esDesayuno}
            onClick={() => onCambiar({ tipo: "desayuno", proteinaId: "" })}
          />
        </div>
      </div>

      {esDesayuno ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-secondary">
              Choose your breakfast
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {opcionesDesayuno.map((o) => (
              <Chip
                key={o.id}
                label={`${o.nombre} — $${Number(o.precio_racion) || 7}`}
                selected={comida.carbohidrato === o.nombre}
                onClick={() => onCambiar({ carbohidrato: o.nombre, proteinaId: o.nombre })}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#c2410c]">
                Protein · Standard
              </p>
              <span className="font-sans text-xs font-bold text-[#c2410c]">
                ${modo === "macro" ? (Number(sencillas[0]?.precio_macro_gramo) || PRECIOS_MACRO.sencilla) : (Number(sencillas[0]?.precio_racion) || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {sencillas.map((p) => (
                <Chip
                  key={p.id}
                  label={p.nombre}
                  selected={comida.proteinaId === p.id}
                  onClick={() => onCambiar({ proteinaId: p.id })}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-green-600">
                Protein · Premium
              </p>
              <span className="font-sans text-xs font-bold text-green-600">
                ${modo === "macro" ? (Number(premium[0]?.precio_macro_gramo) || PRECIOS_MACRO.premium) : (Number(premium[0]?.precio_racion) || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {premium.map((p) => (
                <Chip
                  key={p.id}
                  label={p.nombre}
                  selected={comida.proteinaId === p.id}
                  onClick={() => onCambiar({ proteinaId: p.id })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#b45309] mb-3">
              Carb
            </p>
            <div className="flex flex-wrap gap-2">
              {carbohidratos.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={comida.carbohidrato === c}
                  onClick={() => onCambiar({ carbohidrato: c })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#15803d] mb-3">
              Veggie (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {vegetales.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  selected={comida.vegetal === v}
                  onClick={() =>
                    onCambiar({ vegetal: comida.vegetal === v ? "" : v })
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary">
            <Leaf size={18} className="shrink-0" />
            <p className="font-sans text-sm">
              Includes 1 protein, 1 carb, and 1 veggie.
            </p>
          </div>

          {modo === "macro" && (
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
                  Protein
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosProteina: Math.max(0, comida.gramosProteina - 25),
                      })
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-sans text-lg font-semibold text-on-surface w-16 text-center">
                    {comida.gramosProteina}
                    <span className="text-xs font-normal text-on-surface-variant ml-0.5">g</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosProteina: comida.gramosProteina + 25,
                      })
                    }
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="h-px bg-outline-variant/50" />

              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
                  Carb
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosCarbohidrato: Math.max(0, comida.gramosCarbohidrato - 25),
                      })
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-sans text-lg font-semibold text-on-surface w-16 text-center">
                    {comida.gramosCarbohidrato}
                    <span className="text-xs font-normal text-on-surface-variant ml-0.5">g</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosCarbohidrato: comida.gramosCarbohidrato + 25,
                      })
                    }
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <ExtraToggle
            comida={comida}
            onCambiar={onCambiar}
            proteinas={proteinas}
            carbohidratos={carbohidratos}
            vegetales={vegetales}
          />
        </>
      )}
    </div>
  );
}

function ExtraToggle({
  comida,
  onCambiar,
  proteinas,
  carbohidratos,
  vegetales,
}: {
  comida: ComidaSlot;
  onCambiar: (cambios: Partial<ComidaSlot>) => void;
  proteinas: OpcionMenu[];
  carbohidratos: string[];
  vegetales: string[];
}) {
  return (
    <div>
      <label className="flex items-center justify-between cursor-pointer mb-3">
        <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Add something extra?
        </span>
        <input
          type="checkbox"
          checked={comida.extraActivo}
          onChange={(e) =>
            onCambiar({ extraActivo: e.target.checked, extraValor: "" })
          }
          className="w-5 h-5 rounded text-secondary focus:ring-secondary"
        />
      </label>
      {comida.extraActivo && (
        <div className="space-y-3">
          <div>
            <p className="text-[11px] uppercase mb-1.5 text-[#c2410c] font-bold tracking-wide">
              Another protein <span className="text-[#c2410c]">(+ $1 - $2)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {proteinas.map((p) => (
                <Chip
                  key={p.id}
                  label={`${p.nombre} (+ $${p.nivel === "premium" ? "2" : "1"})`}
                  selected={comida.extraValor === p.nombre}
                  onClick={() => onCambiar({ extraValor: p.nombre })}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase mb-1.5 text-green-600 font-bold tracking-wide">
              Another carb <span className="text-green-600">(+ $0.50)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {carbohidratos.map((c) => (
                <Chip
                  key={c}
                  label={`${c} (+ $0.50)`}
                  selected={comida.extraValor === c}
                  onClick={() => onCambiar({ extraValor: c })}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase mb-1.5 text-teal-600 font-bold tracking-wide">
              Another veggie <span className="text-teal-600">free</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {vegetales.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  selected={comida.extraValor === v}
                  onClick={() => onCambiar({ extraValor: v })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PasoEntrega({
  nombre,
  telefono,
  detalles,
  diaEntrega,
  bienvenidaClienta,
  sedes,
  sedeId,
  onNombreChange,
  onTelefonoChange,
  onTelefonoBlur,
  onDetallesChange,
  onDiaChange,
  onSedeChange,
}: {
  nombre: string;
  telefono: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  bienvenidaClienta: string | null;
  sedes: SedeRetiro[];
  sedeId: string;
  onNombreChange: (v: string) => void;
  onTelefonoChange: (v: string) => void;
  onTelefonoBlur: () => void;
  onDetallesChange: (v: string) => void;
  onDiaChange: (v: DiaEntrega) => void;
  onSedeChange: (v: string) => void;
}) {
  const telefonoInvalido =
    telefono.trim().length > 0 && !TELEFONO_US_REGEX.test(telefono.trim());
  const sedeElegida = sedes.find((s) => s.id === sedeId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Pickup details
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          We need these to coordinate your pickup.
        </p>
      </div>

      {bienvenidaClienta && (
        <p className="text-sm font-sans text-primary bg-primary/10 rounded-xl px-4 py-3">
          Welcome back, {bienvenidaClienta}! We&apos;ve filled in your info.
        </p>
      )}

      {sedes.length > 1 ? (
        <div className="space-y-2">
          <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
            Pickup location
          </label>
          <div className="space-y-3">
            {sedes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSedeChange(s.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
                  sedeId === s.id
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant bg-surface-container-lowest"
                }`}
              >
                <p className="font-sans text-sm text-on-surface flex items-start gap-1.5">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  {s.direccion}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        sedeElegida && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary">
            <MapPin size={18} className="shrink-0 mt-0.5" />
            <p className="font-sans text-sm font-semibold">
              {sedeElegida.direccion}
            </p>
          </div>
        )
      )}

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Phone
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => onTelefonoChange(e.target.value)}
          onBlur={onTelefonoBlur}
          placeholder="(555) 123-4567"
          className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none"
        />
        {telefonoInvalido && (
          <p className="text-xs text-error font-sans">
            Please enter a valid US phone number.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Name
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Your full name"
          className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Additional details (optional)
        </label>
        <textarea
          value={detalles}
          onChange={(e) => onDetallesChange(e.target.value)}
          placeholder="Anything we should know about your pickup?"
          rows={2}
          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Pickup day
        </label>
        <div className="flex gap-3">
          <Chip
            label={etiquetaFecha(proximaFecha(0))}
            selected={diaEntrega === "domingo"}
            onClick={() => onDiaChange("domingo")}
          />
          <Chip
            label={etiquetaFecha(proximaFecha(1))}
            selected={diaEntrega === "lunes"}
            onClick={() => onDiaChange("lunes")}
          />
        </div>
      </div>
    </div>
  );
}

function PasoResumen({
  comidas,
  modo,
  proteinas,
  opcionesDesayuno,
  nombre,
  detalles,
  diaEntrega,
  sede,
  total,
  onEditarPaso,
}: {
  comidas: ComidaSlot[];
  modo: ModoPedido;
  proteinas: OpcionMenu[];
  opcionesDesayuno: OpcionMenu[];
  nombre: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  sede: SedeRetiro | null;
  total: number;
  onEditarPaso: (paso: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Your order summary
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Review everything before sending it via WhatsApp. Tap any card to
          edit it.
        </p>
      </div>

      <div className="space-y-3">
        {comidas.map((c, i) => {
          const proteina = proteinas.find((p) => p.id === c.proteinaId);
          const precio = precioComida(c, modo, proteinas, opcionesDesayuno);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onEditarPaso(i + 2)}
              className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="font-sans text-xs font-bold text-secondary uppercase mb-1 flex items-center gap-1.5">
                  Meal {i + 1} · {c.tipo === "desayuno" ? "Breakfast" : "Regular"}
                  <Pencil size={11} className="opacity-60" />
                </p>
                <p className="font-sans text-sm font-semibold text-primary shrink-0">
                  {formatearMoneda(precio)}
                </p>
              </div>
              <p className="font-sans text-sm text-on-surface">
                {c.tipo === "desayuno"
                  ? c.carbohidrato
                  : `${proteina?.nombre} + ${c.carbohidrato}${c.vegetal ? ` + ${c.vegetal}` : ""}`}
                {c.extraActivo && c.extraValor ? ` + ${c.extraValor}` : ""}
                {modo === "macro" && c.tipo !== "desayuno"
                  ? ` (${c.gramosProteina}g / ${c.gramosCarbohidrato}g)`
                  : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center px-4 py-3 bg-primary/10 rounded-xl">
        <span className="font-sans text-sm font-semibold text-primary">
          Estimated total
        </span>
        <span className="font-display text-xl font-semibold text-primary">
          {formatearMoneda(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onEditarPaso(comidas.length + 2)}
        className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
      >
        <p className="font-sans text-xs font-bold text-secondary uppercase mb-1 flex items-center gap-1.5">
          Pickup
          <Pencil size={11} className="opacity-60" />
        </p>
        <p className="font-sans text-sm text-on-surface">{nombre}</p>
        {sede && (
          <p className="font-sans text-sm text-on-surface-variant">
            {sede.direccion}
          </p>
        )}
        {detalles && (
          <p className="font-sans text-sm text-on-surface-variant italic">
            {detalles}
          </p>
        )}
        <p className="font-sans text-sm text-on-surface-variant">
          {diaEntrega &&
            etiquetaFecha(proximaFecha(diaEntrega === "domingo" ? 0 : 1))}
        </p>
      </button>
    </div>
  );
}

function IntroScreen({ onComenzar }: { onComenzar: () => void }) {
  return (
    <main className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/55 to-primary/85" />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-16 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white flex items-center justify-center mb-6 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JJ Healthy Food" className="w-16 h-16 object-contain" />
        </div>

        <p className="text-secondary-container font-sans text-xs font-bold uppercase tracking-widest mb-3">
          JJ Healthy Food
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white text-balance mb-4">
          Build your healthy meal week in minutes
        </h1>
        <p className="font-sans text-white/80 text-base mb-10">
          We save you time and effort: pick your meals, choose a pickup day,
          and swing by to grab your order.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Leaf className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">Healthy</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">
              Easy pickup
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onComenzar}
          className="bg-secondary text-on-secondary py-4 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
        >
          Start my order
        </button>
      </div>
    </main>
  );
}
