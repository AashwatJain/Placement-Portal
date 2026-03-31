import { useState, useEffect } from "react";
import { fetchOpportunities } from "../services/studentApi";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getOpportunities() {
      try {
        const data = await fetchOpportunities();
        setOpportunities(data);
      } catch (err) {
        console.error("API fetch opportunities error:", err);
        setError(err.message || "Failed to fetch opportunities");
      } finally {
        setLoading(false);
      }
    }

    getOpportunities();
  }, []);

  return { opportunities, loading, error };
}
