import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const cards = [
  { role: "student", title: "Student", desc: "Profile, ATS, recommendations, companies & questions", path: "/student", color: "bg-emerald-500" },
  { role: "admin", title: "Admin", desc: "Student management, add companies, manage questions", path: "/admin/students", color: "bg-blue-500" },
  { role: "recruiter", title: "Recruiter", desc: "View candidates by needs, sort by CGPA", path: "/recruiter", color: "bg-violet-500" },
];

export default function Dashboard() {
  const { user, setRole } = useAuth();
  const navigate = useNavigate();

  const go = (card) => {
    setRole(card.role);
    navigate(card.path);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          NIT Kurukshetra Placement Portal
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Choose your role to continue</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.role}
            onClick={() => go(card)}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
          >
            <span className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.color} text-white`}>
              {card.role === "student" && "S"}
              {card.role === "admin" && "A"}
              {card.role === "recruiter" && "R"}
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{card.desc}</p>
            <span className="mt-4 text-sm font-medium text-amber-600 group-hover:underline dark:text-amber-400">Enter as {card.title} →</span>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        Currently viewing as <strong>{user.role}</strong>. Log out and sign in again to change role.
      </div>
    </div>
  );
}
