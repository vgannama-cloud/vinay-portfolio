import { supabase } from "@/lib/supabase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";

export const revalidate = 60;

async function getData() {
  const [experiencesRes, projectsRes, profileRes, certsRes] = await Promise.all([
    supabase.from("experiences").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("profile").select("*").single(),
    supabase.from("certifications").select("*").order("sort_order"),
  ]);

  return {
    experiences: experiencesRes.data || [],
    projects: projectsRes.data || [],
    profile: profileRes.data,
    certifications: certsRes.data || [],
  };
}

export default async function Home() {
  const { experiences, projects, profile, certifications } = await getData();

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "#6b687c" }}>Loading...</p>
      </div>
    );
  }

  return (
    <main>
      <AnimatedBackground />
      <Navbar resumeUrl={profile.resume_url} />
      <Hero profile={profile} />
      <About profile={profile} />
      <Experience data={experiences} />
      <Projects data={projects} />
      <Certifications data={certifications} />
      <Footer />
    </main>
  );
}
