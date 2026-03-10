import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { Loader2 } from "lucide-react";
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
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser({ uid: firebaseUser.uid, ...userData });
        setIsLoggedIn(true);
        return userData;
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
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
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-xl shadow-indigo-500/20">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
          <p className="animate-pulse text-sm font-medium text-slate-400">Loading your profile...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}