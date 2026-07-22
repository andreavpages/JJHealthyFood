"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";

export function AdminProfileDropdown({
  adminEmail,
  logout,
}: {
  adminEmail: string;
  logout: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold cursor-pointer focus:outline-none"
      >
        {adminEmail.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-high rounded-xl shadow-lg border border-outline-variant py-2 z-50">
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
            onClick={() => setOpen(false)}
          >
            <Settings size={18} />
            Configuración
          </Link>
          <button
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors w-full text-left cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
