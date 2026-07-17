"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, Users, UtensilsCrossed, LogOut } from "lucide-react";
import { logout } from "@/controllers/auth.actions";

const links = [
  { href: "/dashboard", label: "Pedidos", icon: ReceiptText },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/menu", label: "Menú", icon: UtensilsCrossed },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-surface-container-lowest border-t border-outline-variant/40 h-20">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-colors ${
              active
                ? "bg-primary-container text-white"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Icon size={20} />
            <span className="font-sans text-[11px] font-semibold mt-1">
              {label}
            </span>
          </Link>
        );
      })}
      <form action={logout}>
        <button
          type="submit"
          className="flex flex-col items-center justify-center text-error px-4 py-2 rounded-xl hover:bg-error/5 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-sans text-[11px] font-semibold mt-1">
            Salir
          </span>
        </button>
      </form>
    </nav>
  );
}
