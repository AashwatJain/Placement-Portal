import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const ROLE_PROFILES = {
  student: { name: "Student User", email: "student@nitkkr.ac.in" },
  admin: { name: "Admin User", email: "admin@nitkkr.ac.in" },
  recruiter: { name: "Recruiter", email: "recruiter@company.com" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved
      ? JSON.parse(saved)
      : { role: "student", name: ROLE_PROFILES.student.name, email: ROLE_PROFILES.student.email };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("user");
  });

  const login = (email, password, role = "student") => {
    const profile = ROLE_PROFILES[role] || ROLE_PROFILES.student;
    const newUser = {
      role,
      name: profile.name,
      email: email || profile.email,
    };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setIsLoggedIn(false);
    const defaultUser = {
      role: "student",
      name: ROLE_PROFILES.student.name,
      email: ROLE_PROFILES.student.email,
    };
    setUser(defaultUser);
    localStorage.removeItem("user");
  };

  const setRole = (role) => {
    const profile = ROLE_PROFILES[role] || ROLE_PROFILES.student;
    const updatedUser = { ...user, role, name: profile.name, email: profile.email };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}