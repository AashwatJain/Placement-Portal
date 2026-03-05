// src/hooks/useCompanies.js
// ─────────────────────────────────────────────────────────────
// Custom hook — fetches companies from Firestore in real-time.
// Drop-in replacement for MOCK_COMPANIES.
// Returns: { companies, loading, error }
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { fsdb as db } from "../firebase";

export function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    // Real-time listener — updates UI instantly when DB changes
    const q = query(
      collection(db, "companies"),
      orderBy("score", "desc") // highest score first, same visual order
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,       // Firestore document ID (string)
          ...doc.data(),
        }));
        setCompanies(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { companies, loading, error };
}