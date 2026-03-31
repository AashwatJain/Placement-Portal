
import { useState, useEffect } from "react";
import { fetchCompanies } from "../services/studentApi";

export function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getCompanies() {
      try {
        const data = await fetchCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("API fetch error:", err);
        setError(err.message || "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    }

    getCompanies();
  }, []);

  return { companies, loading, error };
}