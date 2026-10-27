export type Profile = {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  about: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string | null;
  skills: string[];
  photo_url: string | null;
  resume_url: string | null;
  // Optional column, see REDESIGN.md
  stats?: { value: string; label: string }[] | null;
};

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string[];
  tags: string[];
  sort_order: number;
  images: string[] | null;
};

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  status: string | null;
  link: string | null;
  github: string | null;
  // Optional columns, see REDESIGN.md
  images?: string[] | null;
  visible?: boolean | null;
  card_rank?: string | null;
  card_suit?: string | null;
  links?: { label: string; url: string }[] | null;
};

export type CertItem = {
  id: string;
  title: string;
  issuer: string;
  description: string | null;
  skills: string[];
  date: string | null;
};

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  details: string | null;
  location: string | null;
  date: string;
  activities: string | null;
  sort_order: number;
};

export type SkillCategory = {
  id: string;
  category: string;
  skills: string[];
  sort_order: number;
};
