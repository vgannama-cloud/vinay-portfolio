"use client";

import type { Profile } from "@/lib/types";
import { downloadResume } from "@/lib/resume";
import { SITE } from "../content";

export default function Hero({ profile }: { profile: Profile }) {
  const parts = (profile.name || "Vinay Gannamaneni").trim().split(/\s+/);
  const first = parts[0];
  const rest = parts.slice(1).join(" ");

  const socials = [
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Email", href: profile.email ? "mailto:" + profile.email : null },
  ].filter((s) => s.href);

  return (
    <section id="top" className="wrap hero">
      <p className="eyebrow rise" style={{ "--d": "0.05s" } as React.CSSProperties}>{SITE.eyebrow}</p>
      <h1 className="rise" style={{ marginTop: 28, "--d": "0.12s" } as React.CSSProperties}>
        {first}
        {rest && (<><br /><em>{rest}</em></>)}
      </h1>
      <div className="rule" aria-hidden="true" />
      {profile.tagline && (
        <p className="lede rise" style={{ "--d": "0.22s" } as React.CSSProperties}>{profile.tagline}</p>
      )}
      <div className="ctas rise" style={{ "--d": "0.3s" } as React.CSSProperties}>
        <a className="btn" href="#experience">See my work <span className="ar">→</span></a>
        {profile.resume_url ? (
          <button type="button" className="ghost" onClick={() => downloadResume(profile.resume_url)}>
            Download resume <span className="ar">↓</span>
          </button>
        ) : (
          <span className="ghost" aria-disabled="true">Download resume <span className="ar">↓</span></span>
        )}
      </div>
      {socials.length > 0 && (
        <div className="socials rise" style={{ "--d": "0.38s" } as React.CSSProperties}>
          {socials.map((s) => (
            <a
              key={s.label}
              className="nl"
              href={s.href!}
              target={s.label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {s.label} <span className="ar">↗</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
