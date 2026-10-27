import type { SkillCategory } from "@/lib/types";

export default function Skills({ data }: { data: SkillCategory[] }) {
  const groups = data.filter((g) => (g.skills || []).filter(Boolean).length > 0);
  if (!groups.length) return null;
  return (
    <section id="skills" className="wrap section">
      <h2 className="h2" data-reveal="" style={{ marginBottom: 32 }}>Skills</h2>
      <div className="skills">
        {groups.map((g, i) => (
          <div key={g.id} data-reveal="" style={{ "--d": `${Math.min(i, 4) * 0.06}s` } as React.CSSProperties}>
            <p className="eyebrow">{g.category}</p>
            <ul>
              {g.skills.filter(Boolean).map((s) => <li key={s} className="chip">{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
