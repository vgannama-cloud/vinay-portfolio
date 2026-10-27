import { DEFAULT_STATS } from "../content";

// Splits "~365" / "60 fps" / "+15%" / "25+" into prefix, number and suffix so the number can count up.
function parse(value: string) {
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  if (!m) return null;
  return { pre: m[1], num: parseInt(m[2], 10), post: m[3] };
}

export default function Stats({ stats }: { stats?: { value: string; label: string }[] | null }) {
  const list = stats && stats.length ? stats : DEFAULT_STATS;
  return (
    <section className="wrap rise" style={{ "--d": "0.4s" } as React.CSSProperties} aria-label="Highlights">
      <div className="stats">
        {list.map((s) => {
          const p = parse(s.value);
          return (
            <div className="stat" key={s.label}>
              <p className="num" aria-label={s.value}>
                {p ? (
                  <>
                    <span aria-hidden="true">{p.pre}</span>
                    <span aria-hidden="true" className="count" style={{ "--to": p.num } as React.CSSProperties} />
                    <span aria-hidden="true">{p.post}</span>
                  </>
                ) : (
                  s.value
                )}
              </p>
              <p className="lbl">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
