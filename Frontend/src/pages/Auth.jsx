import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Eye, EyeOff } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "recruiter", label: "Recruiter" },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    companyName: "",
  });

  const { login, signup, isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user) {
      const path = user.role === "student" ? "/student" : user.role === "admin" ? "/admin/students" : "/recruiter";
      navigate(path, { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole !== "student") setIsLogin(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin && role === "student") {
        const domain = email.split("@")[1];
        if (domain !== "nitkkr.ac.in") {
          showToast({ type: "warning", title: "Invalid Email", message: "Only @nitkkr.ac.in email addresses are allowed for student registration." });
          setLoading(false);
          return;
        }
      }

      if (isLogin) {
        const loggedInUser = await login(email, password);
        const path = loggedInUser.role === "student" ? "/student" : loggedInUser.role === "admin" ? "/admin/students" : "/recruiter";
        navigate(path);
      } else {
        await signup({ email, password, role, ...formData });
        showToast({ type: "success", title: "Registered!", message: "Account created successfully." });
        const path = role === "student" ? "/student" : role === "admin" ? "/admin/students" : "/recruiter";
        navigate(path);
      }
    } catch (error) {
      console.error(error);
      showToast({ type: "error", title: "Authentication Failed", message: error.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream-50 px-4 py-12 dark:bg-[#1A0F08]">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className={`w-full transition-all duration-300 ${!isLogin && (role === 'student' || role === 'recruiter') ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="rounded-2xl border border-brand-beige-200 bg-white p-8 shadow-lg dark:border-[#3E2315] dark:bg-[#2A1810]">
          <div className="mb-8 text-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTat3s5vPAZPuPZtZnsD3QqoAKaqrluxbtLxA&s"
              alt="NIT KKR"
              className="mx-auto h-16 w-16 rounded-full object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold text-brand-brown-900 dark:text-white">Placement Portal</h1>
            <p className="mt-1 text-sm text-brand-brown-600 dark:text-brand-beige-400">
              {isLogin ? "Sign in to continue" : "Create your student profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={isLogin ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300">Email</label>
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nitkkr.ac.in"
                  className="w-full rounded-lg border border-brand-beige-200 px-3 py-2 text-brand-brown-900 focus:border-brand-amber-500 focus:ring-1 focus:ring-brand-amber-500 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-brand-beige-100"
                />
              </div>
              <div className={isLogin ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-brand-beige-200 px-3 py-2 pr-10 text-brand-brown-900 focus:border-brand-amber-500 focus:ring-1 focus:ring-brand-amber-500 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-brand-beige-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-brown-400 hover:text-brand-brown-700 dark:text-brand-beige-400 dark:hover:text-white transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {isLogin && (
              <div className="text-right -mt-1">
                <Link to="/forgot-password" className="text-xs font-medium text-brand-amber-500 hover:underline hover:text-[#E89B60] transition-colors">
                  Forgot Password?
                </Link>
              </div>
            )}

            {isLogin && (
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300">Login as</label>
                <div className="flex gap-2 rounded-lg border border-brand-beige-200 bg-brand-cream-50 p-1 dark:border-[#3E2315] dark:bg-[#1A0F08]">
                  {ROLES.map((r) => (
                    <button key={r.value} type="button"
                      onClick={() => handleRoleChange(r.value)}
                      className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                        role === r.value
                          ? "bg-white text-brand-amber-500 shadow-sm dark:bg-[#3E2315] dark:text-brand-amber-500"
                          : "text-brand-brown-600 hover:text-brand-brown-900 dark:text-brand-beige-400 dark:hover:text-brand-beige-100"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLogin && role === "student" && (
              <div className="mt-6 space-y-4 border-t border-brand-beige-100 pt-6 dark:border-[#3E2315]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-brown-600 dark:text-brand-beige-400">Academic & Personal</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                  <InputField label="Phone No" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91..." />
                  <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Hostel/City" />
                  <InputField label="Branch" name="branch" value={formData.branch} onChange={handleInputChange} placeholder="Computer Engineering" />
                  <InputField label="Year" name="year" value={formData.year} onChange={handleInputChange} placeholder="1st/2nd/3rd/4th" />
                  <InputField label="CGPA" name="cgpa" value={formData.cgpa} onChange={handleInputChange} placeholder="Enter 0.0 if Fresher" />
                </div>

                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-brown-600 dark:text-brand-beige-400">Profiles & Coding Handles</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="GitHub" name="github" value={formData.github} onChange={handleInputChange} placeholder="github.com/user" />
                  <InputField label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/user" />
                  <InputField label="LeetCode ID" name="leetcode" value={formData.leetcode} onChange={handleInputChange} placeholder="lc_handle" />
                  <InputField label="Codeforces ID" name="codeforces" value={formData.codeforces} onChange={handleInputChange} placeholder="cf_handle" />
                  <InputField label="CodeChef ID" name="codechef" value={formData.codechef} onChange={handleInputChange} placeholder="cc_handle" className="sm:col-span-2" />
                </div>
              </div>
            )}

            {!isLogin && role === "recruiter" && (
              <div className="mt-6 space-y-4 border-t border-brand-beige-100 pt-6 dark:border-[#3E2315]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-brown-600 dark:text-brand-beige-400">Professional Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Jane Doe" />
                  <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Google / Microsoft" />
                  <InputField label="Phone No (Optional)" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91..." required={false} />
                  <InputField label="LinkedIn (Optional)" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/user" required={false} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="mt-4 w-full rounded-lg bg-brand-amber-500 py-3 font-medium text-white hover:bg-[#E89B60] disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Processing..." : isLogin ? "Sign in" : "Complete Registration"}
            </button>
          </form>

          {(role === "student" || role === "recruiter") && (
            <p className="mt-6 text-center text-sm text-brand-brown-600 dark:text-brand-beige-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button"
                onClick={() => setIsLogin((x) => !x)}
                className="font-medium text-brand-amber-500 hover:underline hover:text-[#E89B60]"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder, className = "", required = true }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300">{label}</label>
      <input type="text" name={name} required={required} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-lg border border-brand-beige-200 px-3 py-2 text-brand-brown-900 placeholder:text-brand-brown-600 focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-brand-beige-100 dark:placeholder:text-brand-brown-700"
      />
    </div>
  );
}