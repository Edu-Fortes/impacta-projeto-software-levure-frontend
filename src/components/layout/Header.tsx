import Link from "next/link";
import { Wheat, LayoutDashboard, UtensilsCrossed } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Wheat className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Levure</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Painel
          </Link>
          <Link
            href="/fermentos"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-muted text-foreground transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Fermentos
          </Link>
        </nav>
      </div>
    </header>
  );
}
