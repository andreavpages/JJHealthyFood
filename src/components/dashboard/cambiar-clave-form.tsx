"use client";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

export function CambiarClaveForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Contraseña actualizada correctamente." });
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: "Error al actualizar la contraseña." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-sans ${
            message.type === "success"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-error-container text-on-error-container"
          }`}
        >
          {message.text}
        </div>
      )}
      <div>
        <label className="font-sans text-sm font-medium text-on-surface">Nueva contraseña</label>
        <div className="relative mt-1">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <div>
        <label className="font-sans text-sm font-medium text-on-surface">Confirmar contraseña</label>
        <div className="relative mt-1">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            className="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-sans text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
        Cambiar contraseña
      </button>
    </form>
  );
}
