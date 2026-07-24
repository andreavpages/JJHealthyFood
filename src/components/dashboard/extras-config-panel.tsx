"use client";

import { useState, useTransition } from "react";
import { DollarSign, Save, Pencil, X } from "lucide-react";
import { guardarExtrasConfig, toggleExtraOpcion } from "@/controllers/dashboard-menu.actions";
import type { ExtrasConfig } from "@/models/menu.model";
import type { OpcionMenu } from "@/models/types";

function formatearMoneda(valor: number) {
  if (isNaN(valor) || valor === null || valor === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(valor);
}

function PrecioExtraEditor({
  valor,
  onChange,
  disabled,
}: {
  valor: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [tmp, setTmp] = useState(String(valor));

  if (editando) {
    return (
      <input
        type="number"
        min={0}
        step="0.50"
        autoFocus
        value={tmp}
        disabled={disabled}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={() => {
          setEditando(false);
          const num = Number(tmp);
          if (!isNaN(num) && num >= 0) onChange(num);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-16 px-2 py-1 rounded-lg border border-primary font-sans text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setTmp(String(valor));
        setEditando(true);
      }}
      disabled={disabled}
      title="Editar precio extra"
      className="inline-flex items-center gap-1 hover:opacity-80"
    >
      <span className="font-mono text-sm text-on-surface">
        {formatearMoneda(valor)}
      </span>
      <Pencil size={10} className="text-on-surface-variant" />
    </button>
  );
}

function ChipExtra({
  opcion,
  precio,
  onToggleExcluir,
  onEditarPrecio,
  disabled,
}: {
  opcion: OpcionMenu;
  precio: number;
  onToggleExcluir: (excluido: boolean) => void;
  onEditarPrecio: (v: number) => void;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleExtraOpcion(opcion.id, !opcion.excluido_extra);
      onToggleExcluir(!opcion.excluido_extra);
    });
  }

  return (
    <div
      className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-xl border transition-colors ${
        opcion.excluido_extra
          ? "bg-surface-container border-outline-variant/50 opacity-50"
          : "bg-surface-container-low border-outline-variant"
      }`}
    >
      <span className={`font-sans text-sm font-medium ${opcion.excluido_extra ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
        {opcion.nombre}
      </span>
      {!opcion.excluido_extra && (
        <PrecioExtraEditor
          valor={precio}
          onChange={onEditarPrecio}
          disabled={disabled || pending}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || pending}
        title={opcion.excluido_extra ? "Incluir en extras" : "Excluir de extras"}
        className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
          opcion.excluido_extra
            ? "text-on-surface-variant hover:bg-secondary-container hover:text-secondary"
            : "text-on-surface-variant hover:bg-error-container hover:text-error"
        }`}
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ExtrasConfigPanel({
  config,
  proteinas,
  carbohidratos,
  vegetales,
}: {
  config: ExtrasConfig;
  proteinas: OpcionMenu[];
  carbohidratos: OpcionMenu[];
  vegetales: OpcionMenu[];
}) {
  const [valores, setValores] = useState<ExtrasConfig>({ ...config });
  const [items, setItems] = useState<OpcionMenu[]>([...proteinas, ...carbohidratos, ...vegetales]);
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await guardarExtrasConfig(valores);
      setGuardado(true);
    });
  }

  function actualizar(key: keyof ExtrasConfig, v: number) {
    setValores({ ...valores, [key]: v });
  }

  function actualizarItemLocal(id: string, excluido: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, excluido_extra: excluido } : i))
    );
  }

  const proteinasItems = items.filter((i) => i.categoria === "proteina");
  const sencillas = proteinasItems.filter((p) => p.nivel === "sencilla");
  const premium = proteinasItems.filter((p) => p.nivel === "premium");
  const carbsItems = items.filter((i) => i.categoria === "carbohidrato");
  const vegItems = items.filter((i) => i.categoria === "vegetal");

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6">
      <h3 className="font-display text-lg font-semibold text-on-surface mb-1 flex items-center gap-2">
        <DollarSign size={20} />
        Precios de Extras
      </h3>
      <p className="font-sans text-sm text-on-surface-variant mb-5">
        Costo adicional que se cobra cuando la clienta agrega ingredientes extra. Presiona la X para excluir un item de los extras.
      </p>

      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Sencillas <span className="text-on-surface-variant normal-case">· precio extra</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sencillas.map((p) => (
              <ChipExtra
                key={p.id}
                opcion={p}
                precio={valores.proteina_regular}
                onEditarPrecio={(v) => actualizar("proteina_regular", v)}
                onToggleExcluir={(excluido) => actualizarItemLocal(p.id, excluido)}
                disabled={pending}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Premium <span className="text-on-surface-variant normal-case">· precio extra</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {premium.map((p) => (
              <ChipExtra
                key={p.id}
                opcion={p}
                precio={valores.proteina_premium}
                onEditarPrecio={(v) => actualizar("proteina_premium", v)}
                onToggleExcluir={(excluido) => actualizarItemLocal(p.id, excluido)}
                disabled={pending}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Carbohidratos <span className="text-on-surface-variant normal-case">· precio extra</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {carbsItems.map((c) => (
              <ChipExtra
                key={c.id}
                opcion={c}
                precio={valores.carbohidrato}
                onEditarPrecio={(v) => actualizar("carbohidrato", v)}
                onToggleExcluir={(excluido) => actualizarItemLocal(c.id, excluido)}
                disabled={pending}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Vegetales <span className="text-on-surface-variant normal-case">· precio extra</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {vegItems.map((v) => (
              <ChipExtra
                key={v.id}
                opcion={v}
                precio={valores.vegetal}
                onEditarPrecio={(nv) => actualizar("vegetal", nv)}
                onToggleExcluir={(excluido) => actualizarItemLocal(v.id, excluido)}
                disabled={pending}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/50">
        <button
          type="button"
          onClick={guardar}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-sans text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {pending ? "Guardando..." : "Guardar"}
        </button>
        {guardado && (
          <span className="font-sans text-sm text-secondary">Guardado correctamente</span>
        )}
      </div>
    </div>
  );
}
