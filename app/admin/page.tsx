"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cardFor } from "../content";

type Tab = "profile" | "experiences" | "projects" | "skills" | "education" | "certifications";
type Row = Record<string, unknown>;
type Status = "saved" | "saving" | "unsaved" | "error";
type Schema = { stats: boolean; images: boolean; visible: boolean; card: boolean; links: boolean };
type LinkItem = { label: string; url: string };

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "experiences", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
];

const SETUP_SQL = `alter table profile add column if not exists stats jsonb;
alter table projects add column if not exists images text[] default '{}';
alter table projects add column if not exists visible boolean default true;
alter table projects add column if not exists card_rank text;
alter table projects add column if not exists card_suit text;
alter table projects add column if not exists links jsonb default '[]';`;

const STATUS_TEXT: Record<Status, { text: string; color: string }> = {
  saved: { text: "All changes saved", color: "#6bcb8b" },
  saving: { text: "Saving...", color: "#cfb991" },
  unsaved: { text: "Unsaved changes", color: "#e0a458" },
  error: { text: "Couldn’t save, try again", color: "#e58a8a" },
};

const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["♠", "♥", "♦", "♣"];

/* ---------- shared state ---------- */

const AdminCtx = createContext<{ setStatus: (s: Status) => void; schema: Schema; refreshCounts: () => void }>({
  setStatus: () => {},
  schema: { stats: false, images: false, visible: false, card: false, links: false },
  refreshCounts: () => {},
});
const useAdmin = () => useContext(AdminCtx);

async function hasColumn(table: string, column: string) {
  const { error } = await supabase.from(table).select(column).limit(1);
  return !error;
}

async function checkSchema(): Promise<Schema> {
  const [stats, images, visible, card, links] = await Promise.all([
    hasColumn("profile", "stats"),
    hasColumn("projects", "images"),
    hasColumn("projects", "visible"),
    hasColumn("projects", "card_rank,card_suit"),
    hasColumn("projects", "links"),
  ]);
  return { stats, images, visible, card, links };
}

async function uploadToStorage(file: File, prefix: string) {
  const path = prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "." + file.name.split(".").pop();
  const { error } = await supabase.storage.from("images").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

function monthNow() {
  const d = new Date();
  return d.toLocaleString("en-US", { month: "short" }) + " " + d.getFullYear();
}
const isCurrent = (duration: unknown) => /present|now|current/i.test(String(duration || ""));
const startOf = (duration: unknown) => (String(duration || "").split(/\s+[–—-]\s+/)[0] || "").trim();

// A project's links. Until a project is re-saved with the new links field,
// its old GitHub (comma-separated) and Live site values are shown here so nothing is lost.
function linksOf(row: Row): LinkItem[] {
  if (Array.isArray(row.links) && row.links.length) return (row.links as LinkItem[]).map((l) => ({ label: l.label || "", url: l.url || "" }));
  const urls = String(row.github || "").split(/[\s,]+/).map((u) => u.trim()).filter(Boolean);
  const out: LinkItem[] = urls.map((u) => ({ label: urls.length > 1 ? u.replace(/\/+$/, "").split("/").pop() || "GitHub" : "GitHub", url: u }));
  if (row.link) out.push({ label: "Live site", url: String(row.link) });
  return out.slice(0, 3);
}

/* ---------- page ---------- */

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("projects");
  const [status, setStatus] = useState<Status>("saved");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [counts, setCounts] = useState<Partial<Record<Tab, number>>>({});
  const [countsVersion, setCountsVersion] = useState(0);
  const [schemaVersion, setSchemaVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/admin/login"); return; }
      setLoading(false);
    });
    const handleUnload = () => { supabase.auth.signOut(); };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [router]);

  useEffect(() => {
    if (loading) return;
    let active = true;
    checkSchema().then((s) => { if (active) setSchema(s); });
    return () => { active = false; };
  }, [loading, schemaVersion]);

  useEffect(() => {
    if (loading) return;
    let active = true;
    const tables: Tab[] = ["experiences", "projects", "skills", "education", "certifications"];
    Promise.all(tables.map((t) => supabase.from(t).select("id", { count: "exact", head: true }))).then((res) => {
      if (!active) return;
      const next: Partial<Record<Tab, number>> = {};
      res.forEach((r, i) => { next[tables[i]] = r.count ?? 0; });
      setCounts(next);
    });
    return () => { active = false; };
  }, [loading, countsVersion]);

  const refreshCounts = useCallback(() => setCountsVersion((v) => v + 1), []);

  const switchTab = (t: Tab) => {
    if (t === tab) return;
    if (status === "unsaved" && !confirm("You have unsaved changes. Leave this tab and discard them?")) return;
    setStatus("saved");
    setTab(t);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading || !schema) {
    return (
      <div className="adm" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--dim)" }}>Loading...</p>
      </div>
    );
  }

  const needsSetup = !schema.stats || !schema.images || !schema.visible || !schema.card || !schema.links;
  const st = STATUS_TEXT[status];

  return (
    <AdminCtx.Provider value={{ setStatus, schema, refreshCounts }}>
      <div className="adm">
        <div className="adm-stripe" />
        <header className="adm-top">
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/" className="adm-brand">Vinay G. <em>Admin</em></Link>
            <span className="adm-badge">EDITING LIVE SITE</span>
          </div>
          <div className="adm-top-links">
            <span className="adm-status" style={{ "--dot": st.color } as React.CSSProperties} role="status" aria-live="polite">{st.text}</span>
            <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link">View site ↗</a>
            <button type="button" onClick={handleLogout} className="adm-link">Sign out</button>
          </div>
        </header>
        <div className="adm-body">
          <nav className="adm-side" aria-label="Admin sections">
            <p className="adm-side-label">CONTENT</p>
            {TABS.map((t) => (
              <button key={t.key} type="button" className={"adm-tab" + (tab === t.key ? " on" : "")} aria-current={tab === t.key ? "page" : undefined} onClick={() => switchTab(t.key)}>
                <span>{t.label}</span>
                <span className="adm-count">{counts[t.key] ?? ""}</span>
              </button>
            ))}
          </nav>
          <main className="adm-main">
            {needsSetup && (
              <div className="adm-setup">
                <p style={{ fontWeight: 600 }}>One-time setup</p>
                <p className="adm-note" style={{ marginTop: 4, fontSize: 13 }}>
                  Unlocks custom project links, project screenshots, the “Visible on site” toggle, the card-corner picker and editable headline stats. It’s safe to run again if you ran an earlier version.
                  In Supabase, open <strong>SQL Editor</strong> → New query, paste this, and press <strong>Run</strong>.
                </p>
                <pre>{SETUP_SQL}</pre>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="adm-btn sm" onClick={() => { navigator.clipboard.writeText(SETUP_SQL).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}>{copied ? "Copied ✓" : "Copy SQL"}</button>
                  <button type="button" className="adm-btn ghost-btn sm" onClick={() => setSchemaVersion((v) => v + 1)}>I ran it, check again</button>
                </div>
              </div>
            )}
            {tab === "profile" && <ProfileEditor />}
            {tab === "experiences" && <ExperiencesEditor />}
            {tab === "projects" && <ProjectsEditor />}
            {tab === "skills" && <SkillsEditor />}
            {tab === "education" && (
              <SimpleEditor
                table="education"
                title="Education"
                hint="Shown in the Education column on the site."
                blank={{ school: "", degree: "", details: "", location: "", date: "", activities: "" }}
                fields={[
                  { key: "school", label: "School / title" },
                  { key: "degree", label: "Degree / type" },
                  { key: "details", label: "Details (shown in gold)" },
                  { key: "location", label: "Location" },
                  { key: "date", label: "Date" },
                  { key: "activities", label: "Activities" },
                ]}
                titleOf={(r) => String(r.school || "Untitled")}
                subOf={(r) => [r.degree, r.date].filter(Boolean).join(" · ")}
              />
            )}
            {tab === "certifications" && (
              <SimpleEditor
                table="certifications"
                title="Certifications"
                hint="The Certifications block only appears on the site once you add one."
                blank={{ title: "", issuer: "", description: "", skills: [], date: "" }}
                fields={[
                  { key: "title", label: "Title" },
                  { key: "issuer", label: "Issuer" },
                  { key: "date", label: "Date" },
                  { key: "description", label: "Description", kind: "multiline" },
                  { key: "skills", label: "Skills", kind: "tags" },
                ]}
                titleOf={(r) => String(r.title || "Untitled")}
                subOf={(r) => String(r.issuer || "")}
              />
            )}
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}

/* ---------- data hook ---------- */

function useRows(table: string) {
  const { setStatus, refreshCounts } = useAdmin();
  const [items, setItems] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    supabase.from(table).select("*").order("sort_order").then(({ data }) => {
      if (!active) return;
      setItems(data || []);
      setLoaded(true);
    });
    return () => { active = false; };
  }, [table, version]);

  const save = async (row: Row): Promise<Row | null> => {
    setStatus("saving");
    const { id, ...rest } = row;
    const res = id
      ? await supabase.from(table).update(rest).eq("id", id).select().single()
      : await supabase.from(table).insert([rest]).select().single();
    if (res.error) { setStatus("error"); return null; }
    setStatus("saved");
    reload();
    refreshCounts();
    return res.data as Row;
  };

  const patch = async (id: unknown, changes: Row) => {
    setStatus("saving");
    const { error } = await supabase.from(table).update(changes).eq("id", id);
    if (error) { setStatus("error"); return false; }
    setItems((list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    setStatus("saved");
    return true;
  };

  const remove = async (id: unknown) => {
    setStatus("saving");
    const { error } = await supabase.from(table).delete().eq("id", id);
    setStatus(error ? "error" : "saved");
    reload();
    refreshCounts();
    return !error;
  };

  const reorder = async (next: Row[]) => {
    setItems(next.map((r, i) => ({ ...r, sort_order: i + 1 })));
    setStatus("saving");
    const updates = next
      .map((r, i) => (r.sort_order === i + 1 ? null : supabase.from(table).update({ sort_order: i + 1 }).eq("id", r.id)))
      .filter((u): u is NonNullable<typeof u> => u !== null);
    const results = await Promise.all(updates);
    setStatus(results.some((r) => r.error) ? "error" : "saved");
  };

  return { items, loaded, save, patch, remove, reorder };
}

/* ---------- drag to reorder ---------- */

function useReorder(items: Row[], onReorder: (next: Row[]) => void) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onReorder(next);
  };

  const itemProps = (i: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      setDrag(i);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(i));
    },
    onDragOver: (e: React.DragEvent) => {
      if (drag === null) return;
      e.preventDefault();
      if (over !== i) setOver(i);
    },
    onDrop: (e: React.DragEvent) => {
      if (drag === null) return;
      e.preventDefault();
      move(drag, i);
      setDrag(null);
      setOver(null);
    },
    onDragEnd: () => { setDrag(null); setOver(null); },
    "data-drag": drag === i ? "src" : drag !== null && over === i ? "over" : undefined,
  });

  const handleProps = (i: number, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    title: "Drag to reorder",
    "aria-label": `Reorder ${label}. Use the up and down arrow keys to move it.`,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); move(i, i - 1); }
      if (e.key === "ArrowDown") { e.preventDefault(); move(i, i + 1); }
    },
  });

  return { itemProps, handleProps };
}

/* ---------- small components ---------- */

function Field({ label, value, onChange, multiline = false, gold = false, placeholder, type = "text", id }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; gold?: boolean; placeholder?: string; type?: string; id?: string;
}) {
  const fid = id || "f-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="adm-field">
      <label htmlFor={fid} className={"adm-label" + (gold ? " gold" : "")}>{label}</label>
      {multiline ? (
        <textarea id={fid} className="adm-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={fid} className="adm-input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function TagInput({ id, label, value, onChange, placeholder = "Type and press comma" }: {
  id: string; label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [text, setText] = useState("");
  const list = value.filter(Boolean);
  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...list];
    parts.forEach((p) => { if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) next.push(p); });
    onChange(next);
  };
  return (
    <div className="adm-field">
      <label htmlFor={id} className="adm-label">{label}</label>
      <div className="adm-chipbox">
        {list.map((t, i) => (
          <span key={t + i} className="adm-chip">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(list.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) { add(v); setText(""); } else setText(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(text); setText(""); }
            else if (e.key === "Backspace" && !text && list.length) onChange(list.slice(0, -1));
          }}
          onBlur={() => { if (text.trim()) { add(text); setText(""); } }}
        />
      </div>
    </div>
  );
}

function Switch({ checked, onChange, label, small = false, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; small?: boolean; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={"adm-switch" + (small ? " sm" : "")} onClick={() => onChange(!checked)} />
  );
}

function Dropzone({ label, onFiles, busy, accept = "image/*", multiple = true }: { label: string; onFiles: (f: File[]) => void; busy?: boolean; accept?: string; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <>
      <button
        type="button"
        className={"adm-drop" + (over ? " over" : "")}
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => accept === "image/*" ? f.type.startsWith("image/") : true);
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }}
      >
        {busy ? "Uploading..." : label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function ImageStrip({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  if (!images.length) return null;
  return (
    <div className="adm-imgs">
      {images.map((url, i) => (
        <div key={url + i} className="adm-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" />
          <button type="button" aria-label="Remove image" onClick={() => onChange(images.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
    </div>
  );
}

function Head({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="adm-head">
      <div>
        <h2>{title}</h2>
        {hint && <p>{hint}</p>}
      </div>
      {children && <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{children}</div>}
    </div>
  );
}

/* ---------- Projects: list + editor side by side ---------- */

function ProjectsEditor() {
  const { schema, setStatus } = useAdmin();
  const { items, loaded, save, remove, reorder } = useRows("projects");
  const { itemProps, handleProps } = useReorder(items, reorder);
  const [selId, setSelId] = useState<unknown>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [uploading, setUploading] = useState(false);
  const dirty = draft !== null;

  const selected = selId === "new" ? null : items.find((r) => r.id === selId) ?? items[0] ?? null;
  const form: Row | null = draft ?? selected;
  const index = form?.id ? items.findIndex((r) => r.id === form.id) : items.length;
  const auto = cardFor(Math.max(0, index));

  const edit = (changes: Row) => {
    if (!form) return;
    setDraft({ ...form, ...changes });
    setStatus("unsaved");
  };

  const select = (id: unknown) => {
    if (id === (form?.id ?? null)) return;
    if (dirty && !confirm("Discard unsaved changes to this project?")) return;
    setDraft(null);
    setSelId(id);
    setStatus("saved");
  };

  const startNew = () => {
    if (dirty && !confirm("Discard unsaved changes to this project?")) return;
    setSelId("new");
    setDraft({ title: "New project", description: "", tags: [], category: "", status: "", link: "", github: "", links: [{ label: "GitHub", url: "" }], sort_order: items.length + 1, visible: true, images: [], card_rank: "", card_suit: "" });
    setStatus("unsaved");
  };

  const clean = (row: Row) => {
    const out: Row = { ...row };
    if (!schema.visible) delete out.visible;
    if (!schema.images) delete out.images;
    if (!schema.card) { delete out.card_rank; delete out.card_suit; }
    else { out.card_rank = out.card_rank || null; out.card_suit = out.card_suit || null; }
    out.status = out.status || null;
    if (schema.links) {
      // Custom links replace the old GitHub / Live site fields
      out.links = linksOf(row)
        .map((l) => ({ label: l.label.trim() || "Link", url: l.url.trim() }))
        .filter((l) => l.url)
        .slice(0, 3);
      out.github = null;
      out.link = null;
    } else {
      delete out.links;
      out.link = out.link || null;
      out.github = out.github || null;
    }
    return out;
  };

  const onSave = async () => {
    if (!form) return;
    const saved = await save(clean(form));
    if (saved) { setDraft(null); setSelId(saved.id); }
  };

  const onDelete = async () => {
    if (!form) return;
    if (!form.id) { setDraft(null); setSelId(null); setStatus("saved"); return; }
    if (!confirm(`Delete “${form.title}”? This can’t be undone.`)) return;
    if (await remove(form.id)) { setDraft(null); setSelId(null); }
  };

  const onFiles = async (files: File[]) => {
    if (!form) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadToStorage(f, "project")));
      edit({ images: [...((form.images as string[]) || []), ...urls] });
    } catch {
      setStatus("error");
    }
    setUploading(false);
  };

  const visibleOf = (r: Row) => r.visible !== false;
  const formLinks = form ? linksOf(form) : [];
  const setLink = (i: number, changes: Partial<LinkItem>) => edit({ links: formLinks.map((l, j) => (j === i ? { ...l, ...changes } : l)) });
  const str = (k: string) => (form?.[k] as string) || "";

  return (
    <div>
      <Head title="Projects" hint="Shown as cards on the site, in this order. Drag to reorder.">
        <button type="button" className="adm-btn" onClick={startNew}>+ New project</button>
      </Head>
      <div className="adm-split">
        <div className="adm-split-list">
          {loaded && items.length === 0 && selId !== "new" && <p className="adm-empty">No projects yet.</p>}
          {items.map((p, i) => (
            <div key={String(p.id)} className={"adm-proj" + (form?.id === p.id ? " sel" : "")} {...itemProps(i)}>
              <span className="adm-handle" {...handleProps(i, String(p.title))}>⋮⋮</span>
              <button type="button" className="pick" onClick={() => select(p.id)}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(p.title || "Untitled")}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--dim)" }}>{String(p.category || "") || "No date"}</span>
                </span>
                <span className={"adm-vis" + (visibleOf(p) ? "" : " off")}>{visibleOf(p) ? "VISIBLE" : "HIDDEN"}</span>
              </button>
            </div>
          ))}
          {selId === "new" && (
            <div className="adm-proj sel">
              <span className="adm-handle" aria-hidden="true">+</span>
              <span className="pick" style={{ cursor: "default" }}><span style={{ fontWeight: 500 }}>{str("title") || "New project"}</span><span className="adm-vis">NEW</span></span>
            </div>
          )}
          <p className="adm-note" style={{ marginTop: 8, padding: 14, border: "1px dashed #2e2e2e", borderRadius: 10, fontSize: 13 }}>
            The patterned “next project” card shows automatically while you have fewer than 3 projects.
          </p>
        </div>

        {form && (
          <form className="adm-panel adm-split-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{form.id ? "Edit" : "New"} · {str("title") || "Untitled"}</h3>
              <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{form.id ? "ID " + String(form.id).slice(0, 8) : "NOT SAVED YET"}</span>
            </div>
            <div className="adm-grid2">
              <Field id="p-title" label="Title" value={str("title")} onChange={(v) => edit({ title: v })} />
              <Field id="p-date" label="Date (shown on the card, e.g. Nov 2025)" value={str("category")} onChange={(v) => edit({ category: v })} />
            </div>
            <Field id="p-desc" label="Description" value={str("description")} onChange={(v) => edit({ description: v })} multiline />
            <TagInput id="p-tags" label="Tech stack (shown when the card flips over)" value={(form.tags as string[]) || []} onChange={(v) => edit({ tags: v })} />
            <div className="adm-callout">
              {schema.links ? (
                <>
                  <span className="adm-label gold">Links (up to 3), shown as buttons on the back of the card</span>
                  {formLinks.map((l, i) => (
                    <div key={i} className="adm-link-row">
                      <input className="adm-input" aria-label={`Link ${i + 1} name`} placeholder={["GitHub", "Live demo", "Report"][i]} value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} />
                      <input className="adm-input" aria-label={`Link ${i + 1} address`} placeholder="https://..." value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} />
                      <button type="button" className="adm-btn danger sm" style={{ height: 42 }} aria-label={`Remove link ${i + 1}`} onClick={() => edit({ links: formLinks.filter((_, j) => j !== i) })}>×</button>
                    </div>
                  ))}
                  {formLinks.length < 3 && (
                    <button type="button" className="adm-text-btn" onClick={() => edit({ links: [...formLinks, { label: formLinks.length ? "" : "GitHub", url: "" }] })}>+ Add link</button>
                  )}
                  <p className="adm-note" style={{ marginTop: 6 }}>Name each button anything you like, for example “R notebooks” or “Python notebooks”. The first one is gold.</p>
                </>
              ) : (
                <div className="adm-grid2">
                  <Field id="p-gh" label="GitHub link (several? separate with commas)" gold placeholder="Paste your GitHub repo link" value={str("github")} onChange={(v) => edit({ github: v })} />
                  <Field id="p-live" label="Live site link (optional)" type="url" placeholder="Leave empty to hide the button" value={str("link")} onChange={(v) => edit({ link: v })} />
                </div>
              )}
            </div>
            <div className="adm-grid2">
              <div className="adm-field">
                <span className="adm-label">Card corner</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <select className="adm-input" style={{ width: "auto" }} aria-label="Card rank" disabled={!schema.card} value={str("card_rank")} onChange={(e) => edit({ card_rank: e.target.value })}>
                    <option value="">Auto ({auto.rank})</option>
                    {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select className="adm-input" style={{ width: "auto" }} aria-label="Card suit" disabled={!schema.card} value={str("card_suit")} onChange={(e) => edit({ card_suit: e.target.value })}>
                    <option value="">Auto ({auto.suit})</option>
                    {SUITS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <p className="adm-note" style={{ marginTop: 6 }}>{schema.card ? "The small playing-card mark on the card." : "Assigned by order until the one-time setup is run."}</p>
              </div>
              <div className="adm-field">
                <span className="adm-label">Screenshots</span>
                {schema.images ? (
                  <>
                    <ImageStrip images={(form.images as string[]) || []} onChange={(imgs) => edit({ images: imgs })} />
                    <Dropzone label="Drop images or click to upload" busy={uploading} onFiles={onFiles} />
                  </>
                ) : (
                  <p className="adm-note">Available after the one-time setup above.</p>
                )}
              </div>
            </div>
            <Field id="p-status" label="Status badge (optional, e.g. In progress)" value={str("status")} onChange={(v) => edit({ status: v })} />
            <div className="adm-form-foot">
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--muted)" }}>
                <Switch checked={form.visible !== false} disabled={!schema.visible} label="Visible on site" onChange={(v) => edit({ visible: v })} />
                Visible on site
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="adm-btn danger" onClick={onDelete}>{form.id ? "Delete" : "Discard"}</button>
                <button type="submit" className="adm-btn" disabled={!dirty}>Save changes</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Experience: table + edit form ---------- */

function ExperiencesEditor() {
  const { setStatus } = useAdmin();
  const { items, loaded, save, patch, remove, reorder } = useRows("experiences");
  const { itemProps, handleProps } = useReorder(items, reorder);
  const [editing, setEditing] = useState<Row | null>(null);
  const [uploading, setUploading] = useState(false);

  const toggleCurrent = (r: Row, on: boolean) => {
    const start = startOf(r.duration) || monthNow();
    patch(r.id, { duration: `${start} – ${on ? "Present" : monthNow()}` });
  };

  if (editing) {
    const set = (changes: Row) => { setEditing({ ...editing, ...changes }); setStatus("unsaved"); };
    const desc = Array.isArray(editing.description) && (editing.description as string[]).length ? (editing.description as string[]) : [""];
    const images = (editing.images as string[]) || [];
    const onFiles = async (files: File[]) => {
      setUploading(true);
      try {
        const urls = await Promise.all(files.map((f) => uploadToStorage(f, "exp")));
        set({ images: [...images, ...urls] });
      } catch { setStatus("error"); }
      setUploading(false);
    };
    const cancel = () => { setEditing(null); setStatus("saved"); };
    return (
      <div>
        <Head title={(editing.id ? "Edit" : "New") + " role"} hint="Write dates like “Aug 2025 – Present” and the timeline bar draws itself." />
        <form className="adm-panel" onSubmit={async (e) => { e.preventDefault(); const clean = { ...editing, description: desc.filter((d) => d.trim()) }; if (await save(clean)) setEditing(null); }}>
          <div className="adm-grid2">
            <Field id="e-title" label="Role" value={(editing.title as string) || ""} onChange={(v) => set({ title: v })} />
            <Field id="e-company" label="Organization" value={(editing.company as string) || ""} onChange={(v) => set({ company: v })} />
            <Field id="e-loc" label="Location" value={(editing.location as string) || ""} onChange={(v) => set({ location: v })} />
            <Field id="e-dates" label="Dates" value={(editing.duration as string) || ""} onChange={(v) => set({ duration: v })} placeholder="Aug 2025 – Present" />
          </div>
          <div className="adm-field">
            <span className="adm-label">Bullets (the first one shows in the collapsed row)</span>
            {desc.map((line, i) => (
              <div key={i} className="adm-row-bullet">
                <input className="adm-input" aria-label={`Bullet ${i + 1}`} value={line} onChange={(e) => { const d = [...desc]; d[i] = e.target.value; set({ description: d }); }} />
                <button type="button" className="adm-btn danger sm" style={{ height: 42 }} aria-label={`Remove bullet ${i + 1}`} onClick={() => { const d = desc.filter((_, j) => j !== i); set({ description: d.length ? d : [""] }); }}>×</button>
              </div>
            ))}
            <button type="button" className="adm-text-btn" onClick={() => set({ description: [...desc, ""] })}>+ Add bullet</button>
          </div>
          <TagInput id="e-tags" label="Tags" value={(editing.tags as string[]) || []} onChange={(v) => set({ tags: v })} />
          <div className="adm-field">
            <span className="adm-label">Images (shown when the row is expanded)</span>
            <ImageStrip images={images} onChange={(imgs) => set({ images: imgs })} />
            <Dropzone label="Drop images or click to upload" busy={uploading} onFiles={onFiles} />
          </div>
          <div className="adm-form-foot">
            <span />
            <div style={{ display: "flex", gap: 10 }}>
              {editing.id ? <button type="button" className="adm-btn danger" onClick={async () => { if (confirm("Delete this role?") && (await remove(editing.id))) setEditing(null); }}>Delete</button> : null}
              <button type="button" className="adm-btn ghost-btn" onClick={cancel}>Cancel</button>
              <button type="submit" className="adm-btn">Save changes</button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Head title="Experience" hint="Current roles get the gold bar and pulsing dot on the timeline. Drag to reorder.">
        <button type="button" className="adm-btn" onClick={() => setEditing({ title: "", company: "", location: "", duration: "", description: [""], tags: [], images: [], sort_order: items.length + 1 })}>+ Add role</button>
      </Head>
      {loaded && items.length === 0 ? (
        <p className="adm-empty">No roles yet.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 36 }} aria-label="Reorder"></th>
                <th>ROLE</th>
                <th>ORGANIZATION</th>
                <th>DATES</th>
                <th>CURRENT</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={String(r.id)} {...itemProps(i)}>
                  <td><span className="adm-handle" {...handleProps(i, String(r.title))}>⋮⋮</span></td>
                  <td style={{ fontWeight: 500 }}>{String(r.title || "")}</td>
                  <td style={{ color: "var(--muted)" }}>{String(r.company || "")}</td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{String(r.duration || "")}</td>
                  <td><Switch small checked={isCurrent(r.duration)} label={`${String(r.title)} is a current role`} onChange={(v) => toggleCurrent(r, v)} /></td>
                  <td style={{ textAlign: "right" }}><button type="button" className="adm-link" onClick={() => setEditing({ ...r })}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Skills: editable group cards ---------- */

function SkillsEditor() {
  const { items, loaded, save, patch, remove, reorder } = useRows("skills");
  const { itemProps, handleProps } = useReorder(items, reorder);
  const [adding, setAdding] = useState<Record<string, string>>({});
  const [renaming, setRenaming] = useState<{ id: unknown; text: string } | null>(null);

  const addSkills = (r: Row, raw: string) => {
    const skills = ((r.skills as string[]) || []).filter(Boolean);
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean).filter((p) => !skills.some((s) => s.toLowerCase() === p.toLowerCase()));
    if (parts.length) patch(r.id, { skills: [...skills, ...parts] });
  };

  const commitRename = () => {
    if (!renaming) return;
    const text = renaming.text.trim();
    const row = items.find((r) => r.id === renaming.id);
    if (row && text && text !== row.category) patch(row.id, { category: text });
    setRenaming(null);
  };

  return (
    <div>
      <Head title="Skills" hint="Groups appear as columns on the site. Changes save instantly. Drag cards to reorder.">
        <button type="button" className="adm-btn" onClick={async () => { const row = await save({ category: "NEW GROUP", skills: [], sort_order: items.length + 1 }); if (row) setRenaming({ id: row.id, text: "NEW GROUP" }); }}>+ Add group</button>
      </Head>
      {loaded && items.length === 0 && <p className="adm-empty">No skill groups yet.</p>}
      <div className="adm-skillgrid">
        {items.map((r, i) => {
          const key = String(r.id);
          const skills = ((r.skills as string[]) || []).filter(Boolean);
          const renameText = renaming && renaming.id === r.id ? renaming.text : null;
          return (
            <div key={key} className="adm-skillcard" {...itemProps(i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                {renameText !== null ? (
                  <input
                    className="adm-input"
                    aria-label="Group name"
                    value={renameText}
                    autoFocus
                    onChange={(e) => setRenaming({ id: r.id, text: e.target.value })}
                    onBlur={commitRename}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitRename(); } if (e.key === "Escape") setRenaming(null); }}
                    style={{ minHeight: 34, padding: "6px 10px" }}
                  />
                ) : (
                  <button type="button" className="adm-skillname" title="Click to rename" onClick={() => setRenaming({ id: r.id, text: String(r.category || "") })}>{String(r.category || "Untitled")}</button>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button type="button" className="adm-link" style={{ fontSize: 12 }} onClick={() => { if (confirm(`Delete the “${r.category}” group?`)) remove(r.id); }}>Delete</button>
                  <span className="adm-handle" {...handleProps(i, String(r.category))}>⋮⋮</span>
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.map((s, j) => (
                  <span key={s + j} className="adm-chip plain">
                    {s}
                    <button type="button" aria-label={`Remove ${s}`} onClick={() => patch(r.id, { skills: skills.filter((_, k) => k !== j) })}>×</button>
                  </span>
                ))}
                {skills.length === 0 && <span className="adm-note">No skills yet. Groups with no skills are hidden on the site.</span>}
              </div>
              <input
                className="adm-input"
                aria-label={`Add a skill to ${r.category}`}
                placeholder="+ Add skill"
                value={adding[key] || ""}
                style={{ minHeight: 36, padding: "6px 10px", fontSize: 13 }}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.includes(",")) { addSkills(r, v); setAdding({ ...adding, [key]: "" }); } else setAdding({ ...adding, [key]: v });
                }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkills(r, adding[key] || ""); setAdding({ ...adding, [key]: "" }); } }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */

function ProfileEditor() {
  const { schema, setStatus } = useAdmin();
  const [profile, setProfile] = useState<Row | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"" | "photo" | "resume">("");
  const photoInput = useRef<HTMLInputElement>(null);
  const resumeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    supabase.from("profile").select("*").single().then(({ data }) => { if (active) setProfile(data); });
    return () => { active = false; };
  }, []);

  if (!profile) return <p style={{ color: "var(--dim)" }}>Loading...</p>;

  const str = (k: string) => (profile[k] as string) || "";
  const set = (changes: Row) => { setProfile({ ...profile, ...changes }); setDirty(true); setStatus("unsaved"); };

  const save = async () => {
    setStatus("saving");
    const { error } = await supabase.from("profile").update(profile).eq("id", profile.id);
    setStatus(error ? "error" : "saved");
    if (!error) setDirty(false);
  };

  // Photo and resume save straight away, like replacing a file
  const upload = async (file: File, key: "photo_url" | "resume_url", prefix: string) => {
    setBusy(key === "photo_url" ? "photo" : "resume");
    setStatus("saving");
    try {
      const url = await uploadToStorage(file, prefix);
      const { error } = await supabase.from("profile").update({ [key]: url }).eq("id", profile.id);
      if (error) throw error;
      setProfile((p) => (p ? { ...p, [key]: url } : p));
      setStatus(dirty ? "unsaved" : "saved");
    } catch {
      setStatus("error");
    }
    setBusy("");
  };

  const stats = (Array.isArray(profile.stats) ? profile.stats : []) as { value: string; label: string }[];
  const slots = Array.from({ length: 4 }, (_, i) => stats[i] || { value: "", label: "" });
  const setStat = (i: number, k: "value" | "label", v: string) => {
    const next = slots.map((s, j) => (j === i ? { ...s, [k]: v } : s));
    set({ stats: next.filter((s) => s.value.trim() || s.label.trim()) });
  };
  const resumeName = str("resume_url") ? decodeURIComponent(str("resume_url").split("/").pop() || "resume.pdf") : "";

  return (
    <div>
      <Head title="Profile" hint="Hero, About and Contact on the site pull from here.">
        <button type="button" className="adm-btn" onClick={save} disabled={!dirty}>Save profile</button>
      </Head>
      <div className="adm-split">
        <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="adm-photo">
            {str("photo_url") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={str("photo_url")} alt="Profile" />
            ) : (
              <span>[Photo]</span>
            )}
          </div>
          <button type="button" className="adm-btn ghost-btn" disabled={busy === "photo"} onClick={() => photoInput.current?.click()}>{busy === "photo" ? "Uploading..." : "Replace photo"}</button>
          <input ref={photoInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "photo_url", "profile-photo"); e.target.value = ""; }} />
          <div style={{ padding: 12, border: "1px solid #2e2e2e", borderRadius: 8, fontSize: 13 }}>
            <span style={{ display: "block", color: "var(--muted)" }}>Resume PDF</span>
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumeName || "No resume uploaded"}</span>
            <button type="button" className="adm-link" style={{ marginTop: 4, fontSize: 12, padding: 0 }} disabled={busy === "resume"} onClick={() => resumeInput.current?.click()}>{busy === "resume" ? "Uploading..." : "Replace"}</button>
            <input ref={resumeInput} type="file" accept=".pdf,application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "resume_url", "resume"); e.target.value = ""; }} />
          </div>
        </div>
        <form className="adm-split-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="adm-grid2">
            <Field id="pr-name" label="Name" value={str("name")} onChange={(v) => set({ name: v })} />
            <Field id="pr-email" label="Email" value={str("email")} onChange={(v) => set({ email: v })} />
            <Field id="pr-li" label="LinkedIn" value={str("linkedin")} onChange={(v) => set({ linkedin: v })} />
            <Field id="pr-gh" label="GitHub" value={str("github")} onChange={(v) => set({ github: v })} />
          </div>
          <Field id="pr-tag" label="Tagline (the line under your name)" value={str("tagline")} onChange={(v) => set({ tagline: v })} />
          <Field id="pr-about" label="About (each new line becomes its own paragraph)" value={str("about")} onChange={(v) => set({ about: v })} multiline />
          <div className="adm-field">
            <span className="adm-label">Headline stats (count up on the site)</span>
            {schema.stats ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
                  {slots.map((s, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "90px minmax(0, 1fr)", gap: 8 }}>
                      <input className="adm-input" style={{ color: "var(--accent)" }} aria-label={`Stat ${i + 1} value`} placeholder="~365" value={s.value} onChange={(e) => setStat(i, "value", e.target.value)} />
                      <input className="adm-input" aria-label={`Stat ${i + 1} label`} placeholder="what it measures" value={s.label} onChange={(e) => setStat(i, "label", e.target.value)} />
                    </div>
                  ))}
                </div>
                <p className="adm-note" style={{ marginTop: 6 }}>Leave all empty to use the built-in numbers. Values like “~365”, “60 fps”, “+15%” or “25+” count up automatically.</p>
              </>
            ) : (
              <p className="adm-note">Using the built-in numbers. Run the one-time setup above to edit them here.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Education / Certifications ---------- */

type FieldDef = { key: string; label: string; kind?: "text" | "multiline" | "tags" };

function SimpleEditor({ table, title, hint, blank, fields, titleOf, subOf }: {
  table: string; title: string; hint?: string; blank: Row; fields: FieldDef[]; titleOf: (r: Row) => string; subOf: (r: Row) => string;
}) {
  const { setStatus } = useAdmin();
  const { items, loaded, save, remove, reorder } = useRows(table);
  const { itemProps, handleProps } = useReorder(items, reorder);
  const [editing, setEditing] = useState<Row | null>(null);

  if (editing) {
    const set = (changes: Row) => { setEditing({ ...editing, ...changes }); setStatus("unsaved"); };
    return (
      <div>
        <Head title={(editing.id ? "Edit" : "New") + " · " + title} hint={hint} />
        <form className="adm-panel" onSubmit={async (e) => { e.preventDefault(); if (await save(editing)) setEditing(null); }}>
          <div className="adm-grid2">
            {fields.filter((f) => !f.kind || f.kind === "text").map((f) => (
              <Field key={f.key} id={`${table}-${f.key}`} label={f.label} value={(editing[f.key] as string) || ""} onChange={(v) => set({ [f.key]: v })} />
            ))}
          </div>
          {fields.filter((f) => f.kind === "multiline").map((f) => (
            <Field key={f.key} id={`${table}-${f.key}`} label={f.label} multiline value={(editing[f.key] as string) || ""} onChange={(v) => set({ [f.key]: v })} />
          ))}
          {fields.filter((f) => f.kind === "tags").map((f) => (
            <TagInput key={f.key} id={`${table}-${f.key}`} label={f.label} value={(editing[f.key] as string[]) || []} onChange={(v) => set({ [f.key]: v })} />
          ))}
          <div className="adm-form-foot">
            <span />
            <div style={{ display: "flex", gap: 10 }}>
              {editing.id ? <button type="button" className="adm-btn danger" onClick={async () => { if (confirm("Delete this entry?") && (await remove(editing.id))) setEditing(null); }}>Delete</button> : null}
              <button type="button" className="adm-btn ghost-btn" onClick={() => { setEditing(null); setStatus("saved"); }}>Cancel</button>
              <button type="submit" className="adm-btn">Save changes</button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Head title={title} hint={hint ? hint + " Drag to reorder." : "Drag to reorder."}>
        <button type="button" className="adm-btn" onClick={() => setEditing({ ...blank, sort_order: items.length + 1 })}>+ Add</button>
      </Head>
      {loaded && items.length === 0 ? (
        <p className="adm-empty">Nothing here yet.</p>
      ) : (
        <div className="adm-list">
          {items.map((r, i) => (
            <div key={String(r.id)} className="adm-item" {...itemProps(i)}>
              <span className="adm-handle" {...handleProps(i, titleOf(r))}>⋮⋮</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="t">{titleOf(r)}</p>
                <p className="s">{subOf(r)}</p>
              </div>
              <button type="button" className="adm-link" onClick={() => setEditing({ ...r })}>Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
