# Vinay Gannamaneni — Portfolio

A personal portfolio website built from scratch with modern web technologies, featuring scroll-triggered animations, interactive 3D cards, a flowing animated background, and a full admin panel for content management.

🔗 **Live Site:** [vinay-portfolio](https://vinayg.dev)

---

## Features

### Public Site
- **Animated Background** — Canvas-based flowing ribbon animations with ambient gradient blobs
- **Parallax Hero** — Name and photo move at different scroll speeds for depth
- **Scroll-Triggered Reveals** — Sections fade in with blur-to-sharp effects as you scroll
- **Interactive 3D Cards** — Education and about cards tilt in 3D following your cursor
- **Image Lightbox** — Click experience images to view them in a popup with slide animations
- **Image Carousels** — Arrow navigation and dot indicators on experience images
- **Glassmorphic UI** — Frosted glass nav pill, buttons, and badges
- **Categorized Skills Grid** — Skills organized into labeled categories with hover effects
- **Resume Download** — One-click PDF download from nav bar and hero section
- **Responsive Design** — Works on desktop and mobile
- **Dark Theme** — Deep purple/indigo aesthetic

### Admin Panel (`/admin/login`)
- **Secure Authentication** — Email/password login via Supabase Auth
- **Profile Editor** — Edit name, tagline, bio, social links, skills, upload photo and resume
- **Experience Manager** — Add/edit/delete work experiences with bullet points, tags, and image galleries
- **Project Manager** — Add/edit/delete projects with GitHub links, live demo links, tags, and status
- **Education Editor** — Add/edit/delete education entries with location and activities
- **Certifications Manager** — Add/edit/delete certifications with skills and descriptions
- **Image Uploads** — Upload photos directly to Supabase Storage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Inline styles + Tailwind CSS |
| **Animations** | Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel |

---

## Project Structure

```
vinay-portfolio/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx          # Admin login page
│   │   └── page.tsx              # Admin dashboard (CRUD for all content)
│   ├── components/
│   │   ├── About.tsx             # About, education, and skills section
│   │   ├── AnimatedBackground.tsx # Canvas flowing ribbon animation
│   │   ├── Certifications.tsx    # Certifications and activities section
│   │   ├── Experience.tsx        # Work experience with image carousels
│   │   ├── Footer.tsx            # Footer
│   │   ├── Hero.tsx              # Hero section with parallax photo
│   │   ├── Navbar.tsx            # Glassmorphic navigation bar
│   │   └── Projects.tsx          # Projects grid with 3D tilt cards
│   ├── globals.css               # Global styles and CSS variables
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main page (data fetching)
├── lib/
│   └── supabase.ts               # Supabase client
├── .env.local                    # Environment variables (not in repo)
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account
- A Vercel account (for deployment)

### 1. Clone the repo
```bash
git clone https://github.com/vgannama-cloud/vinay-portfolio.git
cd vinay-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database
Run the SQL migrations in your Supabase SQL Editor to create the required tables:
- `profile` — Bio, social links, skills, photo/resume URLs
- `experiences` — Work history with descriptions, tags, and images
- `projects` — Project cards with GitHub/live links
- `education` — Education entries with location and activities
- `certifications` — Certifications with skills

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy
Push to GitHub and import into Vercel. Add your environment variables in the Vercel dashboard.

---

## Admin Panel

Navigate to `/admin/login` and sign in with your Supabase Auth credentials. The admin panel provides full CRUD operations for all content sections — no code changes needed to update your portfolio.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ☕ and Next.js
