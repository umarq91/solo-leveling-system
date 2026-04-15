"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(123,47,255,0.06) 0%, #05050e 60%)" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(26,31,58,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,31,58,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md float-in">
        <div className="text-center mb-8">
          <div className="system-header mb-2 opacity-100">
            ◈ SYSTEM INTERFACE ACTIVE ◈
          </div>
          <h1
            className="text-4xl font-black tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color: "#a78bfa",
              textShadow: "0 0 30px rgba(167,139,250,0.5)",
            }}
          >
            SOLO LEVELING
          </h1>
          <p className="mt-1 text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            NEW HUNTER REGISTRATION
          </p>
        </div>

        <div
          className="relative p-8 rounded-lg"
          style={{
            background: "var(--sl-surface)",
            border: "1px solid var(--sl-border-bright)",
            boxShadow: "0 0 40px rgba(123,47,255,0.08), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: "#a78bfa" }} />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: "#a78bfa" }} />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: "var(--sl-border-bright)" }} />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: "var(--sl-border-bright)" }} />

          <div className="system-header mb-6" style={{ color: "#a78bfa" }}>[ HUNTER REGISTRATION ]</div>

          {/* E-Rank notice */}
          <div
            className="flex items-start gap-3 p-3 rounded mb-6 text-xs"
            style={{ background: "rgba(156,163,175,0.05)", border: "1px solid rgba(156,163,175,0.2)" }}
          >
            <span className="font-mono font-bold shrink-0" style={{ color: "#9ca3af" }}>E</span>
            <p style={{ color: "var(--sl-text-muted)" }}>
              All hunters begin at <strong style={{ color: "#9ca3af" }}>E-Rank</strong>. Complete quests to gain XP, level up, and rise through the ranks.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{ color: "var(--sl-text-muted)" }}>
                Hunter Name
              </label>
              <input
                type="text"
                className="sl-input"
                placeholder="ShadowMonarch"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{ color: "var(--sl-text-muted)" }}>
                Email
              </label>
              <input
                type="email"
                className="sl-input"
                placeholder="hunter@system.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{ color: "var(--sl-text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="sl-input pr-10"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--sl-text-dim)" }}
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-3 py-2 rounded text-xs font-mono"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="sl-btn w-full mt-2"
              style={{
                padding: "0.7rem",
                fontSize: "0.8rem",
                background: "rgba(167,139,250,0.06)",
                border: "1px solid #a78bfa",
                color: "#a78bfa",
              }}
              disabled={loading}
            >
              <UserPlus size={15} />
              {loading ? "CREATING HUNTER..." : "BEGIN YOUR JOURNEY"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            Already a hunter?{" "}
            <Link href="/login" style={{ color: "var(--sl-cyan)" }} className="hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
