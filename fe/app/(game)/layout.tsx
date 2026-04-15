"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import XpBar from "@/components/xp-bar";
import RankBadge from "@/components/rank-badge";
import { LayoutDashboard, Swords, LogOut, Flame, Zap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Quests", icon: Swords },
];

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sl-bg)" }}>
        <div className="text-center">
          <div className="system-header mb-2">LOADING SYSTEM DATA...</div>
          <div className="w-48 h-1 mx-auto" style={{ background: "var(--sl-border)" }}>
            <div className="h-full animate-pulse" style={{ background: "var(--sl-cyan)", width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  const xpPct = Math.min(100, Math.floor((user.current_xp / user.up_to_next) * 100));

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--sl-bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col shrink-0"
        style={{
          background: "var(--sl-surface)",
          borderRight: "1px solid var(--sl-border)",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--sl-border)" }}
        >
          <div
            className="text-sm font-black tracking-widest"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color: "var(--sl-cyan)",
              textShadow: "0 0 12px rgba(0,212,255,0.5)",
            }}
          >
            SOLO LEVELING
          </div>
        </div>

        {/* Player card */}
        <div className="p-4" style={{ borderBottom: "1px solid var(--sl-border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <RankBadge rank={user.rank} size="md" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: "var(--sl-text)" }}>
                {user.username}
              </div>
              <div className="text-xs font-mono flex items-center gap-1" style={{ color: "var(--sl-text-muted)" }}>
                <span>LVL {user.level}</span>
                <span style={{ color: "var(--sl-border-bright)" }}>·</span>
                <span>{user.rank}-Rank</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-1">
            <XpBar current={user.current_xp} max={user.up_to_next} pct={xpPct} />
          </div>
          <div className="flex justify-between text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            <span>{user.current_xp} XP</span>
            <span>{user.up_to_next} XP</span>
          </div>
        </div>

        {/* Streak */}
        {user.streak_days > 0 && (
          <div
            className="mx-4 mt-3 px-3 py-2 rounded flex items-center gap-2"
            style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <Flame size={14} style={{ color: "#fbbf24" }} />
            <span className="text-xs font-mono" style={{ color: "#fbbf24" }}>
              {user.streak_days} Day Streak
            </span>
          </div>
        )}

        {/* Total XP */}
        <div
          className="mx-4 mt-2 px-3 py-2 rounded flex items-center justify-between"
          style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.12)" }}
        >
          <span className="text-xs font-mono flex items-center gap-1" style={{ color: "var(--sl-text-muted)" }}>
            <Zap size={11} />
            Total XP
          </span>
          <span className="text-xs font-mono font-bold" style={{ color: "var(--sl-cyan)" }}>
            {user.total_xp.toLocaleString()}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="system-header px-2 mb-3">NAVIGATION</div>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: "1px solid var(--sl-border)" }}>
          <button
            className="nav-item w-full hover:text-red-400 hover:border-red-400/30"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
