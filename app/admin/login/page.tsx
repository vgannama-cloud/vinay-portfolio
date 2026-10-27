"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="adm-login">
      <div className="adm-stripe" />
      <header className="adm-login-top">
        <Link href="/" className="adm-link">← Back to vinayg.dev</Link>
        <span className="adm-badge">ADMIN AREA · NOT PUBLIC</span>
      </header>
      <main>
        <form onSubmit={handleLogin}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="adm-lock" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CFB991" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            </span>
            <div>
              <h1 className="adm-brand" style={{ fontSize: 26 }}>Vinay G. <em>Admin</em></h1>
              <p style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>Sign in to edit your portfolio</p>
            </div>
          </div>

          {error && <div className="adm-err" role="alert">{error}</div>}

          <div>
            <label htmlFor="email" className="adm-label mono" style={{ fontSize: 11, letterSpacing: "0.12em" }}>EMAIL</label>
            <input id="email" className="adm-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="adm-label mono" style={{ fontSize: 11, letterSpacing: "0.12em" }}>PASSWORD</label>
            <input id="password" className="adm-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="adm-btn" disabled={loading} style={{ height: 48, fontSize: 15 }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="adm-note">Secured with Supabase Auth. You’re signed out automatically when this tab closes.</p>
        </form>
      </main>
    </div>
  );
}
