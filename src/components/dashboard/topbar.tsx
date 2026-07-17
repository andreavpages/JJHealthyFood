import { Search, Bell, Settings, UtensilsCrossed } from "lucide-react";

export function Topbar({ adminEmail }: { adminEmail: string }) {
  return (
    <>
      {/* Barra superior de escritorio */}
      <header className="hidden md:flex fixed top-0 left-[280px] w-[calc(100%-280px)] h-16 bg-surface border-b border-outline-variant items-center justify-between px-6 z-40">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Buscar pedidos, clientes..."
            className="w-full bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-sm font-sans focus:ring-2 focus:ring-primary transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <Settings size={20} />
          </button>
          <div className="h-8 w-px bg-outline-variant mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-sans text-sm text-on-surface">Admin JJ</p>
              <p className="text-[10px] text-on-surface-variant uppercase">
                {adminEmail}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Barra superior movil */}
      <header className="md:hidden flex justify-between items-center w-full px-4 h-16 bg-surface sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
            <UtensilsCrossed className="text-white" size={20} />
          </div>
          <h1 className="font-display text-lg font-bold text-primary">
            JJ Healthy Food
          </h1>
        </div>
        <button
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
        >
          <Bell size={20} />
        </button>
      </header>
    </>
  );
}
