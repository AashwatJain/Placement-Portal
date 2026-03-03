import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const cards = [
  { 
    role: "student", 
    title: "Student Portal", 
    desc: "Manage your profile, track applications, and view coding stats.", 
    path: "/student", 
    color: "bg-emerald-500",
    icon: "🎓" 
  },
  { 
    role: "admin", 
    title: "Admin Console", 
    desc: "Verify students, manage company drives, and post notices.", 
    path: "/admin/students", 
    color: "bg-blue-500",
    icon: "⚙️" 
  },
  { 
    role: "recruiter", 
    title: "Recruiter Hub", 
    desc: "Shortlist candidates, view resumes, and schedule interviews.", 
    path: "/recruiter", 
    color: "bg-violet-500",
    icon: "💼" 
  },
];

export default function Dashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Smart Redirect: Agar user logged in hai, toh use role selector dikhane ki bajaye 
  // seedha uske dashboard par bhej do.
  useEffect(() => {
    if (isLoggedIn && user?.role) {
       // navigate(user.role === 'student' ? '/student' : user.role === 'admin' ? '/admin/students' : '/recruiter');
    }
  }, [isLoggedIn, user, navigate]);

  const handleEntry = (card) => {
    // Security Check: User sirf apne assigned role wale section mein hi ja sakta hai
    if (user?.role !== card.role) {
      alert(`Access Denied! Your assigned role is ${user?.role.toUpperCase()}.`);
      return;
    }
    navigate(card.path);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center space-y-12 py-10">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          NIT Kurukshetra <span className="text-amber-500">Placement Portal</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Welcome back, <span className="font-semibold text-slate-900 dark:text-slate-200">{user?.fullName || user?.email}</span>. 
          Select your portal to continue your work.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 px-4">
        {cards.map((card) => {
          const isMyRole = user?.role === card.role;
          
          return (
            <button
              key={card.role}
              onClick={() => handleEntry(card)}
              className={`group relative flex flex-col rounded-3xl border p-8 text-left transition-all duration-300 shadow-sm
                ${isMyRole 
                  ? "border-amber-500 bg-white dark:bg-slate-800 ring-2 ring-amber-500/20 scale-105" 
                  : "border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50 opacity-70 grayscale hover:grayscale-0"
                } hover:shadow-xl`}
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${card.color} text-2xl shadow-lg`}>
                {card.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {card.title}
              </h2>
              
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {card.desc}
              </p>

              <div className="mt-8 flex items-center font-bold text-amber-600 dark:text-amber-400">
                <span>Enter Portal</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {!isMyRole && (
                <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Locked
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-fit rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        Logged in as: <span className="text-amber-600 dark:text-amber-400 capitalize">{user?.role}</span>
      </div>
    </div>
  );
}