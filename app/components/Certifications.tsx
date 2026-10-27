import type { CertItem, EducationItem } from "@/lib/types";
import { ACTIVITIES } from "../content";

// Education, certifications and activities, laid out as two columns of rows
export default function Certifications({ education, certifications }: { education: EducationItem[]; certifications: CertItem[] }) {
  return (
    <section id="background" className="wrap section">
      <div className="cols">
        <div data-reveal="">
          <h2 className="h2" style={{ marginBottom: 24 }}>Education</h2>
          <div className="mini">
            {education.map((e) => (
              <div key={e.id} className="mini-row">
                <div className="top">
                  <h3>{e.school}</h3>
                  <span className="when">{e.date}</span>
                </div>
                <p className="sub">{e.degree}{e.location ? ` · ${e.location}` : ""}</p>
                {e.details && <p className="gold">{e.details}</p>}
                {e.activities && <p className="sub">Activities: {e.activities}</p>}
              </div>
            ))}
          </div>

          {certifications.length > 0 && (
            <>
              <h2 className="h2" style={{ margin: "64px 0 24px" }}>Certifications</h2>
              <div className="mini">
                {certifications.map((c) => (
                  <div key={c.id} className="mini-row">
                    <div className="top">
                      <h3>{c.title}</h3>
                      {c.date && <span className="when">{c.date}</span>}
                    </div>
                    <p className="sub">{c.issuer}</p>
                    {c.description && <p className="sub">{c.description}</p>}
                    {c.skills?.filter(Boolean).length > 0 && (
                      <div className="tags">{c.skills.filter(Boolean).map((s) => <span key={s} className="tag">{s}</span>)}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div data-reveal="" style={{ "--d": "0.1s" } as React.CSSProperties}>
          <h2 className="h2" style={{ marginBottom: 24 }}>Leadership</h2>
          <div className="mini">
            {ACTIVITIES.map((a) => (
              <div key={a.title} className="mini-row">
                <div className="top">
                  <h3>{a.title}</h3>
                  <span className="when">{a.duration}</span>
                </div>
                <p className="sub">{a.org}</p>
                <ul>{a.description.map((d, i) => <li key={i}>{d}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
