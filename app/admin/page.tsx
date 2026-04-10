"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Tab = "profile" | "experiences" | "projects" | "certifications";

export default function AdminPage() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/admin/login"); return; }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0c12" }}><p style={{ color: "#6b687c" }}>Loading...</p></div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "experiences", label: "Experiences" },
    { key: "projects", label: "Projects" },
    { key: "certifications", label: "Certifications" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c12", color: "#eae8f0" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#eae8f0", textDecoration: "none" }}>Vinay G.</a>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c4a8ff", background: "rgba(196,168,255,0.1)", padding: "4px 12px", borderRadius: 20 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", textDecoration: "none" }}>View Site &#8599;</a>
          <button onClick={handleLogout} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "6px 16px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", color: tab === t.key ? "#fff" : "#6b687c", background: tab === t.key ? "rgba(196,168,255,0.12)" : "rgba(255,255,255,0.03)", border: tab === t.key ? "1px solid rgba(196,168,255,0.2)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 24px", cursor: "pointer", transition: "all 0.3s" }}
            >{t.label}</button>
          ))}
        </div>
        {tab === "profile" && <ProfileEditor />}
        {tab === "experiences" && <ExperiencesEditor />}
        {tab === "projects" && <ProjectsEditor />}
        {tab === "certifications" && <CertificationsEditor />}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 6 }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", minHeight: 100, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#eae8f0", fontSize: 13, resize: "vertical", outline: "none" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#eae8f0", fontSize: 14, outline: "none" }} />
      )}
    </div>
  );
}

function ProfileEditor() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { supabase.from("profile").select("*").single().then(({ data }) => setProfile(data)); }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profile").update(profile).eq("id", profile.id);
    setMsg(error ? "Error saving." : "Saved!");
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, key: string, prefix: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = prefix + "-" + Date.now() + "." + ext;
    await supabase.storage.from("images").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    setProfile({ ...profile!, [key]: data.publicUrl });
  };

  if (!profile) return <p style={{ color: "#6b687c" }}>Loading...</p>;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>Edit Profile</h2>
      <InputField label="Name" value={(profile.name as string) || ""} onChange={(v) => setProfile({ ...profile, name: v })} />
      <InputField label="Tagline" value={(profile.tagline as string) || ""} onChange={(v) => setProfile({ ...profile, tagline: v })} />
      <InputField label="Subtitle" value={(profile.subtitle as string) || ""} onChange={(v) => setProfile({ ...profile, subtitle: v })} />
      <InputField label="About" value={(profile.about as string) || ""} onChange={(v) => setProfile({ ...profile, about: v })} multiline />
      <InputField label="Email" value={(profile.email as string) || ""} onChange={(v) => setProfile({ ...profile, email: v })} />
      <InputField label="GitHub URL" value={(profile.github as string) || ""} onChange={(v) => setProfile({ ...profile, github: v })} />
      <InputField label="LinkedIn URL" value={(profile.linkedin as string) || ""} onChange={(v) => setProfile({ ...profile, linkedin: v })} />
      <InputField label="Twitter URL" value={(profile.twitter as string) || ""} onChange={(v) => setProfile({ ...profile, twitter: v })} />
      <InputField label="Skills (comma separated)" value={Array.isArray(profile.skills) ? (profile.skills as string[]).join(", ") : ""} onChange={(v) => setProfile({ ...profile, skills: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 8 }}>Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => uploadFile(e, "photo_url", "profile-photo")} style={{ fontSize: 13, color: "#b0adc0" }} />
          {profile.photo_url && <p style={{ fontSize: 11, color: "#c4a8ff", marginTop: 8 }}>Photo uploaded &#10003;</p>}
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 8 }}>Resume (PDF)</label>
          <input type="file" accept=".pdf" onChange={(e) => uploadFile(e, "resume_url", "resume")} style={{ fontSize: 13, color: "#b0adc0" }} />
          {profile.resume_url && <p style={{ fontSize: 11, color: "#c4a8ff", marginTop: 8 }}>Resume uploaded &#10003;</p>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={save} disabled={saving} style={{ padding: "12px 32px", background: "rgba(196,168,255,0.15)", border: "1px solid rgba(196,168,255,0.25)", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{saving ? "Saving..." : "Save Changes"}</button>
        {msg && <span style={{ fontSize: 13, color: msg === "Error saving." ? "#f87171" : "#4ade80" }}>{msg}</span>}
      </div>
    </div>
  );
}

function ExperiencesEditor() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const load = useCallback(async () => { const { data } = await supabase.from("experiences").select("*").order("sort_order"); setItems(data || []); }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    if (!editing.id) { await supabase.from("experiences").insert([editing]); } else { await supabase.from("experiences").update(editing).eq("id", editing.id); }
    setEditing(null); setMsg("Saved!"); load(); setTimeout(() => setMsg(""), 3000);
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("experiences").delete().eq("id", id); load(); };
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editing) return;
    setUploading(true);
    const path = "exp-" + Date.now() + "." + file.name.split(".").pop();
    await supabase.storage.from("images").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    const imgs = Array.isArray(editing.images) ? [...editing.images as string[]] : [];
    setEditing({ ...editing, images: [...imgs, data.publicUrl] }); setUploading(false);
  };
  const removeImage = (i: number) => { if (!editing) return; const imgs = [...(editing.images as string[])]; imgs.splice(i, 1); setEditing({ ...editing, images: imgs }); };

  if (editing) {
    const desc = Array.isArray(editing.description) ? editing.description as string[] : [""];
    const tags = Array.isArray(editing.tags) ? editing.tags as string[] : [""];
    const images = Array.isArray(editing.images) ? editing.images as string[] : [];
    return (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>{editing.id ? "Edit" : "New"} Experience</h2>
        {[["Title", "title"], ["Company", "company"], ["Location", "location"], ["Duration", "duration"]].map(([l, k]) => (
          <InputField key={k} label={l} value={(editing[k] as string) || ""} onChange={(v) => setEditing({ ...editing, [k]: v })} />
        ))}
        <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 6 }}>Description bullets</label>
        {desc.map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={line} onChange={(e) => { const d = [...desc]; d[i] = e.target.value; setEditing({ ...editing, description: d }); }} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#eae8f0", fontSize: 13, outline: "none" }} />
            <button onClick={() => { const d = desc.filter((_, j) => j !== i); setEditing({ ...editing, description: d.length ? d : [""] }); }} style={{ padding: "0 12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", cursor: "pointer" }}>&#215;</button>
          </div>
        ))}
        <button onClick={() => setEditing({ ...editing, description: [...desc, ""] })} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#c4a8ff", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>+ Add bullet</button>
        <InputField label="Tags (comma separated)" value={tags.join(", ")} onChange={(v) => setEditing({ ...editing, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c", marginBottom: 8 }}>Images</label>
          {images.length > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: "relative", width: 100, height: 75, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>&#215;</button>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} style={{ fontSize: 13, color: "#b0adc0" }} />
          {uploading && <p style={{ fontSize: 11, color: "#c4a8ff", marginTop: 4 }}>Uploading...</p>}
        </div>
        <InputField label="Sort Order" value={String((editing.sort_order as number) || 0)} onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })} />
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={save} style={{ padding: "10px 28px", background: "rgba(196,168,255,0.15)", border: "1px solid rgba(196,168,255,0.25)", borderRadius: 8, color: "#fff", fontSize: 14, cursor: "pointer" }}>Save</button>
          <button onClick={() => setEditing(null)} style={{ padding: "10px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#b0adc0", fontSize: 14, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500 }}>Experiences</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {msg && <span style={{ fontSize: 13, color: "#4ade80" }}>{msg}</span>}
          <button onClick={() => setEditing({ title: "", company: "", location: "", duration: "", description: [""], tags: [], images: [], sort_order: items.length + 1 })} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#c4a8ff", background: "rgba(196,168,255,0.1)", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 8, padding: "8px 20px", cursor: "pointer" }}>+ Add New</button>
        </div>
      </div>
      {items.map((item) => (
        <div key={item.id as string} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ fontWeight: 500, marginBottom: 2 }}>{item.title as string}</p><p style={{ fontSize: 13, color: "#b0adc0" }}>{item.company as string}</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing({ ...item })} style={{ fontSize: 12, color: "#c4a8ff", background: "none", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Edit</button>
            <button onClick={() => remove(item.id as string)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsEditor() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => { const { data } = await supabase.from("projects").select("*").order("sort_order"); setItems(data || []); }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    if (!editing.id) { await supabase.from("projects").insert([editing]); } else { await supabase.from("projects").update(editing).eq("id", editing.id); }
    setEditing(null); setMsg("Saved!"); load(); setTimeout(() => setMsg(""), 3000);
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("projects").delete().eq("id", id); load(); };

  if (editing) {
    const tags = Array.isArray(editing.tags) ? editing.tags as string[] : [""];
    return (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>{editing.id ? "Edit" : "New"} Project</h2>
        {[["Title", "title"], ["Category", "category"], ["Status", "status"], ["Live Link", "link"], ["GitHub URL", "github"]].map(([l, k]) => (
          <InputField key={k} label={l} value={(editing[k] as string) || ""} onChange={(v) => setEditing({ ...editing, [k]: v })} />
        ))}
        <InputField label="Description" value={(editing.description as string) || ""} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
        <InputField label="Tags (comma separated)" value={tags.join(", ")} onChange={(v) => setEditing({ ...editing, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <InputField label="Sort Order" value={String((editing.sort_order as number) || 0)} onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })} />
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={save} style={{ padding: "10px 28px", background: "rgba(196,168,255,0.15)", border: "1px solid rgba(196,168,255,0.25)", borderRadius: 8, color: "#fff", fontSize: 14, cursor: "pointer" }}>Save</button>
          <button onClick={() => setEditing(null)} style={{ padding: "10px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#b0adc0", fontSize: 14, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500 }}>Projects</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {msg && <span style={{ fontSize: 13, color: "#4ade80" }}>{msg}</span>}
          <button onClick={() => setEditing({ title: "", description: "", tags: [], category: "PROJECT", status: "", link: "", github: "", sort_order: items.length + 1 })} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#c4a8ff", background: "rgba(196,168,255,0.1)", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 8, padding: "8px 20px", cursor: "pointer" }}>+ Add New</button>
        </div>
      </div>
      {items.map((item) => (
        <div key={item.id as string} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ fontWeight: 500, marginBottom: 2 }}>{item.title as string}</p><p style={{ fontSize: 13, color: "#b0adc0" }}>{item.category as string}</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing({ ...item })} style={{ fontSize: 12, color: "#c4a8ff", background: "none", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Edit</button>
            <button onClick={() => remove(item.id as string)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: "#6b687c", fontSize: 14, textAlign: "center", padding: 40 }}>No projects yet.</p>}
    </div>
  );
}

function CertificationsEditor() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => { const { data } = await supabase.from("certifications").select("*").order("sort_order"); setItems(data || []); }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    if (!editing.id) { await supabase.from("certifications").insert([editing]); } else { await supabase.from("certifications").update(editing).eq("id", editing.id); }
    setEditing(null); setMsg("Saved!"); load(); setTimeout(() => setMsg(""), 3000);
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("certifications").delete().eq("id", id); load(); };

  if (editing) {
    const skills = Array.isArray(editing.skills) ? editing.skills as string[] : [];
    return (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>{editing.id ? "Edit" : "New"} Certification</h2>
        {[["Title", "title"], ["Issuer", "issuer"], ["Date", "date"]].map(([l, k]) => (
          <InputField key={k} label={l} value={(editing[k] as string) || ""} onChange={(v) => setEditing({ ...editing, [k]: v })} />
        ))}
        <InputField label="Description" value={(editing.description as string) || ""} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
        <InputField label="Skills (comma separated)" value={skills.join(", ")} onChange={(v) => setEditing({ ...editing, skills: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <InputField label="Sort Order" value={String((editing.sort_order as number) || 0)} onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })} />
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={save} style={{ padding: "10px 28px", background: "rgba(196,168,255,0.15)", border: "1px solid rgba(196,168,255,0.25)", borderRadius: 8, color: "#fff", fontSize: 14, cursor: "pointer" }}>Save</button>
          <button onClick={() => setEditing(null)} style={{ padding: "10px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#b0adc0", fontSize: 14, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500 }}>Certifications</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {msg && <span style={{ fontSize: 13, color: "#4ade80" }}>{msg}</span>}
          <button onClick={() => setEditing({ title: "", issuer: "", description: "", skills: [], date: "", sort_order: items.length + 1 })} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#c4a8ff", background: "rgba(196,168,255,0.1)", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 8, padding: "8px 20px", cursor: "pointer" }}>+ Add New</button>
        </div>
      </div>
      {items.map((item) => (
        <div key={item.id as string} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ fontWeight: 500, marginBottom: 2 }}>{item.title as string}</p><p style={{ fontSize: 13, color: "#b0adc0" }}>{item.issuer as string}</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing({ ...item })} style={{ fontSize: 12, color: "#c4a8ff", background: "none", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Edit</button>
            <button onClick={() => remove(item.id as string)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: "#6b687c", fontSize: 14, textAlign: "center", padding: 40 }}>No certifications yet. Click + Add New to create one.</p>}
    </div>
  );
}
