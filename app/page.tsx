import { supabase } from "@/lib/supabase";
import type { Profile, ExperienceItem, ProjectItem, CertItem, EducationItem, SkillCategory } from "@/lib/types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Certifications from "./components/Certifications";
import Footer from "./components/Footer";
import StarField from "./components/StarField";
import RaceTrack from "./components/RaceTrack";
import RevealObserver from "./components/RevealObserver";

export const revalidate = 60;

async function getData() {
  const [experiencesRes, projectsRes, profileRes, certsRes, eduRes, skillsRes] = await Promise.all([
    supabase.from("experiences").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("profile").select("*").single(),
    supabase.from("certifications").select("*").order("sort_order"),
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("sort_order"),
  ]);

  return {
    experiences: (experiencesRes.data || []) as ExperienceItem[],
    projects: ((projectsRes.data || []) as ProjectItem[]).filter((p) => p.visible !== false),
    profile: profileRes.data as Profile | null,
    certifications: (certsRes.data || []) as CertItem[],
    education: (eduRes.data || []) as EducationItem[],
    skillCategories: (skillsRes.data || []) as SkillCategory[],
  };
}

export default async function Home() {
  const { experiences, projects, profile, certifications, education, skillCategories } = await getData();

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="mono" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <StarField />
      <Navbar resumeUrl={profile.resume_url} />
      <main className="site">
        <RaceTrack />
        <Hero profile={profile} />
        <Stats stats={profile.stats} />
        <About profile={profile} />
        <Experience data={experiences} />
        <Projects data={projects} />
        <Skills data={skillCategories} />
        <Certifications education={education} certifications={certifications} />
        <Footer profile={profile} />
      </main>
      <RevealObserver />
    </>
  );
}
