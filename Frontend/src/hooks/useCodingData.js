import { useState, useEffect } from "react";
import { DASHBOARD_STATS, PLATFORM_DATA } from "../data/mockData";

export function useCodingData() {
  const [stats, setStats] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // --- SIMULATING API CALL (Replace this block with fetch/axios later) ---
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 sec delay
        
        setStats(DASHBOARD_STATS);
        setPlatforms(PLATFORM_DATA);
        // ---------------------------------------------------------------------

      } catch (err) {
        setError("Failed to fetch coding data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, platforms, loading, error };
}