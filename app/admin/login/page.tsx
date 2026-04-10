"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0c12", padding: 20 }}>
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 40 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#eae8f0", marginBottom: 8 }}>Admin Login</h1>
        <p style={{ fontSize: 14, color: "#6b687c", marginBottom: 32 }}>Sign in to manage your portfolio.</p>

        {error && (
          <div style={{ background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.2)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#f87171" }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 8 }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#eae8f0", fontSize: 14, marginBottom: 20, outline: "none" }}
        />

        <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 8 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#eae8f0", fontSize: 14, marginBottom: 28, outline: "none" }}
        />

        <button type="submit" disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "rgba(196,168,255,0.1)" : "rgba(196,168,255,0.15)", border: "1px solid rgba(196,168,255,0.25)", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 500, cursor: loading ? "wait" : "pointer", transition: "all 0.3s" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
