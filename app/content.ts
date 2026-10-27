// Static content that isn't stored in Supabase.
// Everything else (profile, experience, projects, skills, education, certifications)
// is edited from the admin panel at /admin.

export const SITE = {
  eyebrow: "Purdue University · CS, Machine Intelligence · Class of ’29",
  coords: `17°43'03.5"N 83°19'47.1"E`,
  egg: "Boiler up. Bear down.",
};

// Shown under the About heading.
export const QUICK_FACTS: { label: string; value: string; muted?: boolean }[] = [
  { label: "Studying", value: "B.S. Computer Science, Purdue University" },
  { label: "Concentration", value: "Machine Intelligence" },
  { label: "Minors", value: "Mathematics, Management" },
  { label: "Certificate", value: "Applications in Data Science" },
  { label: "Off the clock", value: "Race weekends, card nights, football Sundays", muted: true },
];

// Headline numbers under the hero. If you add a `stats` column to the
// profile table (see REDESIGN.md), the admin panel values replace these.
export const DEFAULT_STATS: { value: string; label: string }[] = [
  { value: "~365", label: "enterprise tables migrated to dbt" },
  { value: "60 fps", label: "real-time vision pipeline" },
  { value: "+15%", label: "track performance, autonomous kart" },
  { value: "25+", label: "data analysis projects" },
];

export const ACTIVITIES: { title: string; org: string; duration: string; description: string[] }[] = [
  {
    title: "Student Council Representative",
    org: "Silver Oaks International School",
    duration: "Jul 2023 – Apr 2025",
    description: [
      "Coordinated 13+ school-wide initiatives and events, managing communication between students and faculty.",
      "Led 6+ peer teams to execute large-scale student activities and resolve operational issues.",
    ],
  },
  {
    title: "BITS Model United Nations, Delegate",
    org: "BITS Pilani",
    duration: "Nov 2024",
    description: [
      "Developed public speaking and negotiation skills through structured debates on international policy.",
      "Analyzed complex global issues to draft resolution papers and lead diplomatic caucuses.",
    ],
  },
];

// Playing-card corner for each project, in sort order: K♠, A♥, Q♦, J♣, 10♠, ...
const RANKS = ["K", "A", "Q", "J", "10", "9", "8", "7"];
const SUITS = ["♠", "♥", "♦", "♣"];
export function cardFor(index: number) {
  return { rank: RANKS[index % RANKS.length], suit: SUITS[index % SUITS.length] };
}
