import type { Profile } from "@/lib/types";
import { SITE } from "../content";

export default function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  const links = [
    profile.email && { label: profile.email, href: "mailto:" + profile.email, external: false },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin, external: true },
    profile.github && { label: "GitHub", href: profile.github, external: true },
  ].filter(Boolean) as { label: string; href: string; external: boolean }[];

  return (
    <footer id="contact" className="wrap section">
      <h2 className="talk" data-reveal="">Let’s <em>talk.</em></h2>
      <div className="contact-links" data-reveal="" style={{ "--d": "0.1s" } as React.CSSProperties}>
        {links.map((l) => (
          <a key={l.label} className="nl" href={l.href} target={l.external ? "_blank" : undefined} rel="noopener noreferrer">
            {l.label} {l.external && <span className="ar">↗</span>}
          </a>
        ))}
      </div>
      <div className="foot">
        <p className="egg">© {year} Vinay Gannamaneni <span className="hid">· {SITE.egg}</span></p>
        <p>{SITE.coords} · build 16</p>
        <a className="nl" href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
