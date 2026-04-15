"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--sl-bg)" }}
    >
      <div className="text-center">
        <div className="system-header mb-2">INITIALIZING SYSTEM...</div>
        <div
          className="text-sm font-mono"
          style={{ color: "var(--sl-text-dim)" }}
        >
          Please wait
        </div>
      </div>
    </div>
  );
}
