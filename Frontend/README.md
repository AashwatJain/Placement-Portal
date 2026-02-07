# NIT KKR Placement Portal

Frontend-only placement portal for NIT Kurukshetra — React + Tailwind CSS. No backend or ML; all data is mock.

## Structure (from your sitemap)

- **Dashboard** — Role selection (Student / Admin / Recruiter)
- **Student:** Home (Check ATS, Recommendations), Profile (details, Transcript, Codolio), Company (filters, prep, alumni), Add Questions → Company, Calendar
- **Admin:** Student Management, Company Add, Questions → Company, Calendar
- **Recruiter:** Only showing needs, Sort by CGPA, Calendar
- **Calendar** — Events/deadlines (linked from Company)

## Run

```bash
cd app
npm install   # if not done
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Use the **role dropdown** (next to your name in the header) to switch between Student, Admin, and Recruiter.

## Tech

- **Vite** + **React** + **React Router**
- **Tailwind CSS** (v4 with `@tailwindcss/vite`)
- Mock data in `src/data/mockData.js`

## Later

- Backend API and real auth
- ML-based recommendations / placement probability (skipped for now)
- Notifications / mail or SMS (UI placeholder only)
