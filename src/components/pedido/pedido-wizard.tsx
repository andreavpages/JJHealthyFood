"use client";

import { useState, useTransition } from "react";
import {
  UtensilsCrossed,
  ChevronLeft,
  MapPin,
  Send,
  Clock,
  Leaf,
  Truck,
} from "lucide-react";
import { Chip } from "./chip";
import {
  buscarClientaPorTelefono,
  enviarPedido,
  type ComidaSeleccionada,
  type DatosEntrega,
} from "@/controllers/pedidos.actions";
import type { DiaEntrega } from "@/models/types";

const MAX_COMIDAS = 5;

type TipoComida = "regular" | "desayuno";

type ComidaSlot = {
  tipo: TipoComida;
  proteina: string;
  carbohidrato: string;
};

const comidaVacia: ComidaSlot = {
  tipo: "regular",
  proteina: "",
  carbohidrato: "",
};

function proximaFecha(diaSemana: number): Date {
  const hoy = new Date();
  const diff = (diaSemana - hoy.getDay() + 7) % 7;
  const resultado = new Date(hoy);
  resultado.setDate(hoy.getDate() + diff);
  return resultado;
}

function etiquetaFecha(fecha: Date) {
  const texto = new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function etiquetaPaso(paso: number, cantidad: number) {
  if (paso === 0) return "Cantidad";
  if (paso <= cantidad) return `Comida ${paso}`;
  if (paso === cantidad + 1) return "Entrega";
  return "Resumen";
}

export function PedidoWizard({
  proteinas,
  carbohidratos,
  opcionesDesayuno,
}: {
  proteinas: string[];
  carbohidratos: string[];
  opcionesDesayuno: string[];
}) {
  const [iniciado, setIniciado] = useState(false);
  const [paso, setPaso] = useState(0);
  const [cantidad, setCantidad] = useState(5);
  const [comidas, setComidas] = useState<ComidaSlot[]>(
    Array.from({ length: MAX_COMIDAS }, () => ({ ...comidaVacia }))
  );
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [detalles, setDetalles] = useState("");
  const [diaEntrega, setDiaEntrega] = useState<DiaEntrega | "">("");
  const [bienvenidaClienta, setBienvenidaClienta] = useState<string | null>(
    null
  );
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const totalPasos = cantidad + 3; // cantidad selector + N comidas + entrega + resumen
  const esPasoCantidad = paso === 0;
  const esPasoComida = paso >= 1 && paso <= cantidad;
  const esPasoEntrega = paso === cantidad + 1;
  const esPasoResumen = paso === cantidad + 2;

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
      if (!direccion && encontrada.direccion) setDireccion(encontrada.direccion);
    }
  }

  function puedeAvanzar() {
    if (esPasoCantidad) return true;
    if (esPasoComida) {
      const c = comidas[paso - 1];
      if (c.tipo === "desayuno") return Boolean(c.proteina);
      return Boolean(c.proteina && c.carbohidrato);
    }
    if (esPasoEntrega) {
      return Boolean(nombre.trim() && telefono.trim() && direccion.trim() && diaEntrega);
    }
    return true;
  }

  function siguiente() {
    if (!puedeAvanzar()) return;
    setPaso((p) => Math.min(p + 1, totalPasos - 1));
  }

  function atras() {
    setPaso((p) => Math.max(p - 1, 0));
  }

  function enviar() {
    if (!diaEntrega) return;
    setError(null);

    const datosEntrega: DatosEntrega = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      detalles: detalles.trim(),
      dia_entrega: diaEntrega,
    };

    const comidasSeleccionadas: ComidaSeleccionada[] = comidas
      .slice(0, cantidad)
      .map((c, i) => ({
        numero_comida: i + 1,
        proteina: c.proteina,
        carbohidrato: c.tipo === "desayuno" ? "Waffles" : c.carbohidrato,
        extra: null,
        es_desayuno: c.tipo === "desayuno",
      }));

    startTransition(async () => {
      const resultado = await enviarPedido(datosEntrega, comidasSeleccionadas);
      if (resultado.success) {
        setEnviado(true);
        window.location.href = resultado.whatsappUrl;
      } else {
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
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <UtensilsCrossed className="text-white" size={18} />
        </div>
        <div>
          <h1 className="font-display text-base font-semibold text-primary leading-none">
            JJ Healthy Food
          </h1>
          <p className="text-[11px] text-on-surface-variant uppercase tracking-widest mt-0.5">
            Arma tu pedido
          </p>
        </div>
      </header>

      {/* Progreso */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-sans font-semibold text-on-surface-variant">
            Paso {paso + 1} de {totalPasos} · {etiquetaPaso(paso, cantidad)}
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
          <PasoCantidad cantidad={cantidad} onCambiar={setCantidad} />
        )}

        {esPasoComida && (
          <PasoComida
            numero={paso}
            comida={comidas[paso - 1]}
            onCambiar={(cambios) => actualizarComida(paso - 1, cambios)}
            proteinas={proteinas}
            carbohidratos={carbohidratos}
            opcionesDesayuno={opcionesDesayuno}
          />
        )}

        {esPasoEntrega && (
          <PasoEntrega
            nombre={nombre}
            telefono={telefono}
            direccion={direccion}
            detalles={detalles}
            diaEntrega={diaEntrega}
            bienvenidaClienta={bienvenidaClienta}
            onNombreChange={setNombre}
            onTelefonoChange={setTelefono}
            onTelefonoBlur={alSalirDeTelefono}
            onDireccionChange={setDireccion}
            onDetallesChange={setDetalles}
            onDiaChange={setDiaEntrega}
          />
        )}

        {esPasoResumen && (
          <PasoResumen
            comidas={comidas.slice(0, cantidad)}
            nombre={nombre}
            direccion={direccion}
            detalles={detalles}
            diaEntrega={diaEntrega}
            onEditarPaso={setPaso}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-error font-sans" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Barra inferior de navegacion */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant/40 px-4 py-4 flex items-center gap-3">
        {paso > 0 && !enviado && (
          <button
            type="button"
            onClick={atras}
            className="flex items-center gap-1 px-4 py-3 text-on-surface-variant font-sans text-sm font-semibold"
          >
            <ChevronLeft size={18} />
            Atrás
          </button>
        )}
        {!esPasoResumen ? (
          <button
            type="button"
            onClick={siguiente}
            disabled={!puedeAvanzar()}
            className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
          >
            Siguiente
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
              ? "Enviando..."
              : enviado
                ? "Redirigiendo a WhatsApp..."
                : "Enviar pedido por WhatsApp"}
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
          ¿Cuántas comidas quieres?
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Elige entre 1 y {MAX_COMIDAS} comidas. En el siguiente paso decides,
          una por una, si cada comida es regular o desayuno.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: MAX_COMIDAS }, (_, i) => i + 1).map((n) => (
          <Chip
            key={n}
            label={String(n)}
            selected={cantidad === n}
            onClick={() => onCambiar(n)}
          />
        ))}
      </div>
    </div>
  );
}

function PasoComida({
  numero,
  comida,
  onCambiar,
  proteinas,
  carbohidratos,
  opcionesDesayuno,
}: {
  numero: number;
  comida: ComidaSlot;
  onCambiar: (cambios: Partial<ComidaSlot>) => void;
  proteinas: string[];
  carbohidratos: string[];
  opcionesDesayuno: string[];
}) {
  const esDesayuno = comida.tipo === "desayuno";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Comida {numero}
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Elige el tipo de comida y luego arma sus ingredientes.
        </p>
      </div>

      <div>
        <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-3">
          Tipo de comida
        </p>
        <div className="flex gap-2">
          <Chip
            label="Comida regular"
            selected={comida.tipo === "regular"}
            onClick={() => onCambiar({ tipo: "regular", proteina: "" })}
          />
          <Chip
            label="Desayuno"
            selected={esDesayuno}
            onClick={() => onCambiar({ tipo: "desayuno", proteina: "" })}
          />
        </div>
      </div>

      {esDesayuno ? (
        <div>
          <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-3">
            Elige tu desayuno
          </p>
          <div className="flex flex-wrap gap-2">
            {opcionesDesayuno.map((o) => (
              <Chip
                key={o}
                label={o}
                selected={comida.proteina === o}
                onClick={() => onCambiar({ proteina: o })}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-3">
              Proteína
            </p>
            <div className="flex flex-wrap gap-2">
              {proteinas.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={comida.proteina === p}
                  onClick={() => onCambiar({ proteina: p })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-3">
              Carbohidrato
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

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary">
            <Leaf size={18} className="shrink-0" />
            <p className="font-sans text-sm">
              Todas las comidas vienen acompañadas de vegetales.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function PasoEntrega({
  nombre,
  telefono,
  direccion,
  detalles,
  diaEntrega,
  bienvenidaClienta,
  onNombreChange,
  onTelefonoChange,
  onTelefonoBlur,
  onDireccionChange,
  onDetallesChange,
  onDiaChange,
}: {
  nombre: string;
  telefono: string;
  direccion: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  bienvenidaClienta: string | null;
  onNombreChange: (v: string) => void;
  onTelefonoChange: (v: string) => void;
  onTelefonoBlur: () => void;
  onDireccionChange: (v: string) => void;
  onDetallesChange: (v: string) => void;
  onDiaChange: (v: DiaEntrega) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Datos de entrega
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Los necesitamos para coordinar tu entrega.
        </p>
      </div>

      {bienvenidaClienta && (
        <p className="text-sm font-sans text-primary bg-primary/10 rounded-xl px-4 py-3">
          ¡Bienvenida de nuevo, {bienvenidaClienta}! Ya llenamos tus datos.
        </p>
      )}

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Teléfono
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => onTelefonoChange(e.target.value)}
          onBlur={onTelefonoBlur}
          placeholder="0412-1234567"
          className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Tu nombre completo"
          className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Dirección
        </label>
        <div className="relative">
          <MapPin size={18} className="absolute left-4 top-4 text-outline" />
          <textarea
            value={direccion}
            onChange={(e) => onDireccionChange(e.target.value)}
            placeholder="Calle, casa/apto, urbanización, zona"
            rows={2}
            className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none resize-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Detalles adicionales (opcional)
        </label>
        <textarea
          value={detalles}
          onChange={(e) => onDetallesChange(e.target.value)}
          placeholder="Punto de referencia, portón, instrucciones para el repartidor..."
          rows={2}
          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Día de entrega
        </label>
        <div className="flex gap-3">
          <Chip
            label={etiquetaFecha(proximaFecha(3))}
            selected={diaEntrega === "miercoles"}
            onClick={() => onDiaChange("miercoles")}
          />
          <Chip
            label={etiquetaFecha(proximaFecha(4))}
            selected={diaEntrega === "jueves"}
            onClick={() => onDiaChange("jueves")}
          />
        </div>
      </div>
    </div>
  );
}

function PasoResumen({
  comidas,
  nombre,
  direccion,
  detalles,
  diaEntrega,
  onEditarPaso,
}: {
  comidas: ComidaSlot[];
  nombre: string;
  direccion: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  onEditarPaso: (paso: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Resumen de tu pedido
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Revisa todo antes de enviarlo por WhatsApp.
        </p>
      </div>

      <div className="space-y-3">
        {comidas.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onEditarPaso(i + 1)}
            className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
          >
            <p className="font-sans text-xs font-bold text-secondary uppercase mb-1">
              Comida {i + 1} · {c.tipo === "desayuno" ? "Desayuno" : "Regular"}
            </p>
            <p className="font-sans text-sm text-on-surface">
              {c.tipo === "desayuno"
                ? c.proteina
                : `${c.carbohidrato} + ${c.proteina}`}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onEditarPaso(comidas.length + 1)}
        className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
      >
        <p className="font-sans text-xs font-bold text-secondary uppercase mb-1">
          Entrega
        </p>
        <p className="font-sans text-sm text-on-surface">{nombre}</p>
        <p className="font-sans text-sm text-on-surface-variant">
          {direccion}
        </p>
        {detalles && (
          <p className="font-sans text-sm text-on-surface-variant italic">
            {detalles}
          </p>
        )}
        <p className="font-sans text-sm text-on-surface-variant">
          {diaEntrega &&
            etiquetaFecha(proximaFecha(diaEntrega === "miercoles" ? 3 : 4))}
        </p>
      </button>
    </div>
  );
}

function IntroScreen({ onComenzar }: { onComenzar: () => void }) {
  return (
    <main className="min-h-screen bg-primary flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-16 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-6">
          <UtensilsCrossed className="text-white" size={30} />
        </div>

        <p className="text-secondary-container font-sans text-xs font-bold uppercase tracking-widest mb-3">
          JJ Healthy Food
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white text-balance mb-4">
          Arma tu semana de comida saludable en minutos
        </h1>
        <p className="font-sans text-white/80 text-base mb-10">
          Te ahorramos tiempo y esfuerzo: elige tus comidas, danos tu
          dirección, y te la entregamos donde estés.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">Rápido</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Leaf className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">Saludable</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Truck className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">A tu puerta</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onComenzar}
          className="bg-secondary text-on-secondary py-4 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
        >
          Comenzar mi pedido
        </button>
      </div>
    </main>
  );
}
