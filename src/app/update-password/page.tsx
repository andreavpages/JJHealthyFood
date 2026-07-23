"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UpdatePasswordForm } from "@/components/update-password-form";

function UpdatePasswordContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;

    fetch(`/api/auth/callback?code=${code}`)
      .then((res) => {
        if (res.ok) {
          window.location.href = "/update-password";
        } else {
          setError(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [code]);

  if (loading && code) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface">
        <p className="font-sans text-on-surface-variant">Cargando...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="font-sans text-error mb-4">El enlace expiró o no es válido.</p>
          <a href="/reset-password" className="font-sans text-sm font-semibold text-secondary hover:underline">
            Solicitar un nuevo enlace
          </a>
        </div>
      </main>
    );
  }

  return <UpdatePasswordForm />;
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-surface">
          <p className="font-sans text-on-surface-variant">Cargando...</p>
        </main>
      }
    >
      <UpdatePasswordContent />
    </Suspense>
  );
}
