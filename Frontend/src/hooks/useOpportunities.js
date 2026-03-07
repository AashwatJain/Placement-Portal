// src/hooks/useOpportunities.js
// Real-time listener on Firestore "opportunities" collection.
import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { fsdb as db } from "../firebase";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  useEffect(() => {
    const q = query(collection(db, "opportunities"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setOpportunities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore opportunities error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { opportunities, loading, error };
}
