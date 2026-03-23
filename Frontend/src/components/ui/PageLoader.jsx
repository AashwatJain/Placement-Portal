import { GraduationCap } from "lucide-react";

/**
 * Premium page-level loader — matches the app's brown/amber theme.
 * Use instead of bare <Loader2 className="animate-spin" />.
 *
 * @param {string} message — optional loading text (default: "Loading...")
 */
export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      {/* Spinner container */}
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>

        {/* Outer ring */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 80 80"
          style={{ animation: "ring-outer 2.5s linear infinite" }}
        >
          <defs>
            <linearGradient id="pgOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C07840" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C07840" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="36" fill="none" stroke="url(#pgOuter)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="120 110" />
        </svg>

        {/* Inner ring (reverse, violet) */}
        <svg
          className="absolute"
          style={{ width: 52, height: 52, animation: "ring-mid 1.8s linear infinite" }}
          viewBox="0 0 52 52"
        >
          <defs>
            <linearGradient id="pgInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle cx="26" cy="26" r="22" fill="none" stroke="url(#pgInner)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 80" />
        </svg>

        {/* Center icon */}
        <div
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C07840] to-violet-600 text-white shadow-lg shadow-[#C07840]/25"
          style={{ animation: "core-pulse 2.5s ease-in-out infinite" }}
        >
          <GraduationCap className="h-5 w-5" style={{ animation: "icon-breathe 3s ease-in-out infinite" }} />
        </div>
      </div>

      {/* Message */}
      <p
        className="text-sm font-medium tracking-wide"
        style={{
          background: "linear-gradient(90deg, #5A3D2B, #C07840, #7c3aed, #D4944F, #5A3D2B)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 2.5s linear infinite",
        }}
      >
        {message}
      </p>
    </div>
  );
}
