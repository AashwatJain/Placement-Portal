import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { GraduationCap } from "lucide-react";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setUser({ uid: firebaseUser.uid, ...snapshot.val() });
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (userData) => {
    const { email, password, role, ...extraDetails } = userData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const profileData = {
        email,
        role,
        ...(role === "student" || role === "recruiter" ? extraDetails : {}),
        createdAt: new Date().toISOString(),
      };

      await set(ref(db, `users/${newUser.uid}`), profileData);

      return { success: true };
    } catch (error) {
      console.error("Signup Error:", error.message);
      const code = error?.code;
      if (code === "auth/email-already-in-use") {
        // User exists in Auth but maybe not in RTDB — try to sign in and create profile
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const snapshot = await get(ref(db, `users/${cred.user.uid}`));
          if (!snapshot.exists()) {
            const profileData = {
              email,
              role,
              ...(role === "student" || role === "recruiter" ? extraDetails : {}),
              createdAt: new Date().toISOString(),
            };
            await set(ref(db, `users/${cred.user.uid}`), profileData);
            setUser({ uid: cred.user.uid, ...profileData });
            setIsLoggedIn(true);
            return { success: true, recovered: true };
          }
        } catch {
          // Sign-in failed (wrong password) — show the original message
        }
        throw new Error("This email is already registered. Please sign in instead.");
      } else if (code === "auth/weak-password") {
        throw new Error("Password is too weak. Please use at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (code === "auth/network-request-failed") {
        throw new Error("Network error. Please check your internet connection.");
      }
      throw new Error("Registration failed. Please try again later.");
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (!userData.role) {
          throw new Error("Your account profile is incomplete. Please contact the admin.");
        }
        setUser({ uid: firebaseUser.uid, ...userData });
        setIsLoggedIn(true);
        return userData;
      } else {
        // User exists in Firebase Auth but no profile in RTDB
        await signOut(auth);
        throw new Error("Account not found. Please sign up first or contact the placement cell.");
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      // Re-throw with user-friendly messages
      const code = error?.code;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      } else if (code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/network-request-failed") {
        throw new Error("Network error. Please check your internet connection.");
      } else if (code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (error.message && !error.code) {
        // Already a friendly message (from our checks above)
        throw error;
      }
      throw new Error("Unable to sign in right now. Please try again later.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    try {
      const snapshot = await get(ref(db, `users/${auth.currentUser.uid}`));
      if (snapshot.exists()) {
        setUser({ uid: auth.currentUser.uid, ...snapshot.val() });
      }
    } catch (error) {
      console.error("Refresh Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout, refreshUser, token: auth.currentUser?.accessToken }}>
      {loading ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-cream-50 dark:bg-[#1A0F08] overflow-hidden">

          {/* Ambient background glow orbs */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-[#C07840]/20 to-transparent blur-3xl" style={{ animation: 'bg-glow 4s ease-in-out infinite', top: '20%', left: '30%' }} />
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tl from-violet-500/15 to-transparent blur-3xl" style={{ animation: 'bg-glow 5s ease-in-out 1s infinite', bottom: '20%', right: '25%' }} />

          {/* === MAIN LOADER === */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>

            {/* Ring 1 — Outer (large, amber, slow) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160" style={{ animation: 'ring-outer 3s linear infinite' }}>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C07840" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#C07840" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="74" fill="none" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="180 280" />
            </svg>

            {/* Ring 2 — Mid (violet, reverse) */}
            <svg className="absolute" style={{ width: 120, height: 120, animation: 'ring-mid 2.2s linear infinite' }} viewBox="0 0 120 120">
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeDasharray="120 220" />
            </svg>

            {/* Ring 3 — Inner (small, amber+violet gradient, fast) */}
            <svg className="absolute" style={{ width: 88, height: 88, animation: 'ring-inner 1.5s linear infinite' }} viewBox="0 0 88 88">
              <defs>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C07840" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#C07840" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <circle cx="44" cy="44" r="38" fill="none" stroke="url(#grad3)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="80 160" />
            </svg>

            {/* Floating particles */}
            <div className="absolute h-2 w-2 rounded-full bg-[#C07840]" style={{ animation: 'float-1 3s ease-out infinite', bottom: '50%', left: '50%' }} />
            <div className="absolute h-1.5 w-1.5 rounded-full bg-violet-400" style={{ animation: 'float-2 3.5s ease-out 0.5s infinite', bottom: '50%', left: '50%' }} />
            <div className="absolute h-1 w-1 rounded-full bg-[#C07840]" style={{ animation: 'float-3 4s ease-out 1s infinite', bottom: '50%', left: '50%' }} />

            {/* Center core — pulsing glow + icon */}
            <div
              className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C07840] via-[#D4944F] to-violet-600 text-white"
              style={{ animation: 'core-pulse 2.5s ease-in-out infinite' }}
            >
              <GraduationCap className="h-8 w-8" style={{ animation: 'icon-breathe 3s ease-in-out infinite' }} />
            </div>
          </div>

          {/* Shimmer title */}
          <p
            className="mt-8 text-base font-bold tracking-widest uppercase"
            style={{
              background: 'linear-gradient(90deg, #5A3D2B, #C07840, #7c3aed, #D4944F, #5A3D2B)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'text-reveal 0.6s ease-out both, shimmer 2.5s linear 0.6s infinite',
            }}
          >
            Placement Portal
          </p>

          {/* Subtitle */}
          <p
            className="mt-1 text-xs font-medium text-brand-brown-400/70 dark:text-brand-beige-400/60 tracking-wider"
            style={{ animation: 'text-reveal 0.6s ease-out 0.2s both' }}
          >
            NIT Kurukshetra
          </p>

          {/* Mini progress bar */}
          <div className="mt-6 h-[3px] w-48 rounded-full bg-brand-beige-200/60 dark:bg-[#3E2315]/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C07840] via-violet-500 to-[#C07840]"
              style={{ animation: 'progress-fill 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}