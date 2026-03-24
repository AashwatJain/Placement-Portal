import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ui/ThemeToggle";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      showToast({ type: "success", title: "Email Sent!", message: "Check your inbox for the password reset link." });
    } catch (error) {
      console.error("Reset error:", error.message);
      const code = error?.code;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        showToast({ type: "error", title: "Not Found", message: "No account found with this email." });
      } else if (code === "auth/invalid-email") {
        showToast({ type: "error", title: "Invalid Email", message: "Please enter a valid email address." });
      } else if (code === "auth/too-many-requests") {
        showToast({ type: "warning", title: "Too Many Requests", message: "Please wait a few minutes before trying again." });
      } else {
        showToast({ type: "error", title: "Error", message: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream-50 px-4 py-12 dark:bg-[#1A0F08]">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-brand-beige-200 bg-white p-8 shadow-lg dark:border-[#3E2315] dark:bg-[#2A1810]">

          {/* Header */}
          <div className="mb-6 text-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTat3s5vPAZPuPZtZnsD3QqoAKaqrluxbtLxA&s"
              alt="NIT KKR"
              className="mx-auto h-14 w-14 rounded-full object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold text-brand-brown-900 dark:text-white">
              {sent ? "Check Your Email" : "Reset Password"}
            </h1>
            <p className="mt-1 text-sm text-brand-brown-600 dark:text-brand-beige-400">
              {sent
                ? "We've sent a password reset link to your email"
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          {sent ? (
            /* ── Success State ── */
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-brand-brown-600 dark:text-brand-beige-400">
                A reset link has been sent to <strong className="text-brand-brown-900 dark:text-white">{email}</strong>. Click the link in the email to set a new password.
              </p>
              <p className="text-xs text-brand-brown-500 dark:text-brand-beige-500">
                Didn't get it? Check your spam folder or{" "}
                <button type="button" onClick={() => setSent(false)}
                  className="font-medium text-brand-amber-500 hover:underline hover:text-[#E89B60]">
                  try again
                </button>
              </p>
            </div>
          ) : (
            /* ── Email Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-400 dark:text-brand-beige-500" size={16} />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@nitkkr.ac.in"
                    className="w-full rounded-lg border border-brand-beige-200 px-3 py-2 pl-9 text-brand-brown-900 focus:border-brand-amber-500 focus:ring-1 focus:ring-brand-amber-500 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-brand-beige-100"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-brand-amber-500 py-3 font-medium text-white hover:bg-[#E89B60] disabled:opacity-50 transition-colors shadow-sm">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {/* Back to login */}
          <Link to="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-amber-500 hover:text-[#E89B60] hover:underline transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
