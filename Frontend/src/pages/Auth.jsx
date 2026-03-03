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
  const [loading, setLoading] = useState(false); // Loading state add kiya hai
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    branch: "",
    year: "",
    cgpa: "",
    github: "",
    linkedin: "",
    leetcode: "",
    codeforces: "",
    codechef: "",
  });

  const { login, signup, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      const path = user.role === "student" ? "/student" : user.role === "admin" ? "/admin/students" : "/recruiter";
      navigate(path, { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login Logic
        const loggedInUser = await login(email, password);
        // Role based redirect
        const path = loggedInUser.role === "student" ? "/student" : loggedInUser.role === "admin" ? "/admin/students" : "/recruiter";
        navigate(path);
      } else {
        // Signup Logic: Pura data bhej rahe hain
        await signup({ email, password, role, ...formData });
        alert("Account Created Successfully!");
        // Signup ke baad automatic redirect logic AuthContext handle kar lega ya hum navigate use kar sakte hain
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className={`w-full transition-all duration-300 ${!isLogin && role === 'student' ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-8 text-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTat3s5vPAZPuPZtZnsD3QqoAKaqrluxbtLxA&s"
              alt="NIT KKR"
              className="mx-auto h-16 w-16 rounded-full object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Placement Portal</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Sign in to continue" : "Create your student profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={isLogin ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nitkkr.ac.in"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className={isLogin ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Role Switcher */}
            <div>
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

            {/* Student Sign-Up Fields */}
            {!isLogin && role === "student" && (
              <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 dark:border-slate-700">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Academic & Personal</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                  <InputField label="Phone No" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91..." />
                  <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Hostel/City" />
                  <InputField label="Branch" name="branch" value={formData.branch} onChange={handleInputChange} placeholder="Computer Engineering" />
                  <InputField label="Year" name="year" value={formData.year} onChange={handleInputChange} placeholder="1st/2nd/3rd/4th" />
                  <InputField 
                    label="CGPA" 
                    name="cgpa" 
                    value={formData.cgpa} 
                    onChange={handleInputChange} 
                    placeholder="Enter 0.0 if Fresher" 
                  />
                </div>

                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">Profiles & Coding Handles</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="GitHub" name="github" value={formData.github} onChange={handleInputChange} placeholder="github.com/user" />
                  <InputField label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/user" />
                  <InputField label="LeetCode ID" name="leetcode" value={formData.leetcode} onChange={handleInputChange} placeholder="lc_handle" />
                  <InputField label="Codeforces ID" name="codeforces" value={formData.codeforces} onChange={handleInputChange} placeholder="cf_handle" />
                  <InputField label="CodeChef ID" name="codechef" value={formData.codechef} onChange={handleInputChange} placeholder="cc_handle" className="sm:col-span-2" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-amber-500 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {loading ? "Processing..." : isLogin ? "Sign in" : "Complete Registration"}
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

function InputField({ label, name, value, onChange, placeholder, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="text"
        name={name}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  );
}