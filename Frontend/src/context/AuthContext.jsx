import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase"; // Aapki firebase config file
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { Loader2 } from "lucide-react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Firebase sync hone tak wait karne ke liye

  // 1. Session Persistence: Page refresh hone par user ko wapas fetch karna
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User login hai, database se uska data (role, details) nikalein
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

  // 2. Signup: Firebase Auth + Realtime DB
  const signup = async (userData) => {
    const { email, password, role, ...studentDetails } = userData;
    try {
      // Auth mein account banayein
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Realtime Database mein saara data (CGPA, Branch, etc.) save karein
      const profileData = {
        email,
        role,
        ...(role === "student" ? studentDetails : {}), // Sirf student ke liye extra fields
        createdAt: new Date().toISOString(),
      };

      await set(ref(db, `users/${newUser.uid}`), profileData);

      return { success: true };
    } catch (error) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  };

  // 3. Login: Simple Email/Password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Database se user ka role aur profile fetch karein
      const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser({ uid: firebaseUser.uid, ...userData });
        setIsLoggedIn(true);
        return userData; // Navigation ke liye role return karein
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  // 4. Refresh user data from DB (e.g., after profile update or navigation)
  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const snapshot = await get(ref(db, `users/${currentUser.uid}`));
      if (snapshot.exists()) {
        setUser({ uid: currentUser.uid, ...snapshot.val() });
      }
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout, refreshUser, token: auth.currentUser?.accessToken }}>
      {loading ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-xl shadow-indigo-500/20">
            <span className="text-3xl tracking-tighter">P<span className="text-indigo-200">P</span></span>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="mt-4 animate-pulse text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}