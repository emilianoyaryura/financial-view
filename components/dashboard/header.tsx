"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Search } from "@/components/dashboard/search";
import { useDollar } from "@/lib/hooks/use-dollar";
import { useTheme } from "@/lib/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/design-system/dropdown";
import { getSupabaseClient } from "@/supabase/client";
import type { Currency } from "@/lib/types";
import { MoonIcon, SunIcon, ExitIcon } from "@radix-ui/react-icons";

const AVATAR_COLORS = [
  { name: "blue", bg: "bg-blue-500", text: "text-white" },
  { name: "yellow", bg: "bg-amber-400", text: "text-amber-950" },
  { name: "orange", bg: "bg-orange-500", text: "text-white" },
  { name: "purple", bg: "bg-purple-500", text: "text-white" },
] as const;

const AVATAR_COLOR_KEY = "stockar_avatar_color";

function getAvatarColor() {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(AVATAR_COLOR_KEY);
  if (stored !== null) {
    const idx = parseInt(stored, 10);
    if (idx >= 0 && idx < AVATAR_COLORS.length) return idx;
  }
  const idx = Math.floor(Math.random() * AVATAR_COLORS.length);
  localStorage.setItem(AVATAR_COLOR_KEY, String(idx));
  return idx;
}

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onSelectStock: (ticker: string, name: string) => void;
}

export function Header({
  currency,
  onCurrencyChange,
  onSelectStock,
}: HeaderProps) {
  const { data: dollar, isLoading } = useDollar();
  const { theme, toggleTheme, mounted } = useTheme();
  const dollarRate = dollar?.mep?.venta ?? 0;

  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    setColorIndex(getAvatarColor());
  }, []);

  const avatarColor = AVATAR_COLORS[colorIndex];

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="contain flex items-center justify-between h-14 gap-4">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="text-sm font-semibold tracking-tight text-foreground shrink-0">
            StockAR
          </span>
          <Search onSelectStock={onSelectStock} />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dollar badge */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs text-foreground-tertiary">MEP</span>
            {isLoading ? (
              <div className="h-3 w-16 bg-background-secondary rounded animate-pulse-subtle" />
            ) : (
              <span className="text-xs font-mono font-medium text-foreground">
                {dollarRate > 0
                  ? formatCurrency(dollarRate, "ARS")
                  : "\u2014"}
              </span>
            )}
          </div>

          {/* Currency toggle */}
          <div className="flex bg-background-secondary rounded-full p-0.5">
            {(["USD", "ARS"] as const).map((c, i) => (
              <button
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={cn(
                  "text-xs font-mono px-2.5 py-1.5 transition-colors",
                  i === 0 ? "rounded-l-full" : "rounded-r-full",
                  currency === c
                    ? "bg-surface text-foreground"
                    : "text-foreground-tertiary hover:text-foreground-secondary"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Avatar dropdown */}
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground-tertiary/50",
                    avatarColor.bg,
                    avatarColor.text
                  )}
                  aria-label="User menu"
                >
                  U
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-44">
                <DropdownMenuItem
                  onClick={toggleTheme}
                  className="text-foreground"
                >
                  {theme === "dark" ? (
                    <SunIcon className="w-3.5 h-3.5 text-foreground-tertiary" />
                  ) : (
                    <MoonIcon className="w-3.5 h-3.5 text-foreground-tertiary" />
                  )}
                  <span className="text-xs">
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-negative"
                >
                  <ExitIcon className="w-3.5 h-3.5" />
                  <span className="text-xs">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
