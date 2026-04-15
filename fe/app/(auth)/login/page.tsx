"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.06) 0%, #05050e 60%)" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(26,31,58,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,31,58,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md float-in">
        {/* System header */}
        <div className="text-center mb-8">
          <div className="system-header mb-2 opacity-100">
            ◈ SYSTEM INTERFACE ACTIVE ◈
          </div>
          <h1
            className="text-4xl font-black tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color: "var(--sl-cyan)",
              textShadow: "0 0 30px rgba(0,212,255,0.5)",
            }}
          >
            SOLO LEVELING
          </h1>
          <p className="mt-1 text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            HUNTER AUTHENTICATION SYSTEM
          </p>
        </div>

        {/* Card */}
        <div
          className="relative p-8 rounded-lg"
          style={{
            background: "var(--sl-surface)",
            border: "1px solid var(--sl-border-bright)",
            boxShadow: "0 0 40px rgba(0,212,255,0.08), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: "var(--sl-cyan)" }} />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: "var(--sl-cyan)" }} />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: "var(--sl-border-bright)" }} />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: "var(--sl-border-bright)" }} />

          <div className="system-header mb-6">[ HUNTER LOGIN ]</div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="email"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
              className="sl-btn sl-btn-primary w-full mt-2"
              style={{ padding: "0.7rem", fontSize: "0.8rem" }}
              disabled={loading}
            >
              <LogIn size={15} />
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            New hunter?{" "}
            <Link href="/register" style={{ color: "var(--sl-cyan)" }} className="hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
