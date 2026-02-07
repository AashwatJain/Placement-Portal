import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "recruiter", label: "Recruiter" },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      const path = user.role === "student" ? "/student" : user.role === "admin" ? "/admin/students" : "/recruiter";
      navigate(path, { replace: true });
    }
  }, [isLoggedIn, user.role, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email || undefined, password, role);
    const path = role === "student" ? "/student" : role === "admin" ? "/admin/students" : "/recruiter";
    navigate(path, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-8 text-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTat3s5vPAZPuPZtZnsD3QqoAKaqrluxbtLxA&s"
              alt="NIT KKR"
              className="mx-auto h-16 w-16 rounded-full object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Placement Portal</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Sign in to continue" : "Create an account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nitkkr.ac.in"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Login as</label>
              <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-700">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                      role === r.value
                        ? "bg-white text-amber-700 shadow-sm dark:bg-slate-600 dark:text-amber-300"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500 py-2.5 font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin((x) => !x)}
              className="font-medium text-amber-600 hover:underline dark:text-amber-400"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
