import type { Profile } from "@/lib/types";
import { QUICK_FACTS } from "../content";

export default function About({ profile }: { profile: Profile }) {
  // Blank lines (or line breaks) in the admin "About" field become separate paragraphs
  const paragraphs = (profile.about || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="about" className="wrap section">
      <div className="about">
        <div className="photo" data-reveal="">
          <span className="tk tl" aria-hidden="true" />
          <span className="tk br" aria-hidden="true" />
          {profile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photo_url} alt={profile.name} />
          ) : (
            <p className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>Photo coming soon</p>
          )}
        </div>
        <div className="about-body" data-reveal="" style={{ "--d": "0.1s" } as React.CSSProperties}>
          <h2 className="h2">About</h2>
          <dl className="facts">
            {QUICK_FACTS.map((f) => (
              <div key={f.label} style={{ display: "contents" }}>
                <dt>{f.label}</dt>
                <dd className={f.muted ? "muted" : undefined}>{f.value}</dd>
              </div>
            ))}
          </dl>
          {paragraphs.map((p, i) => (
            <p key={i} className="para">{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
