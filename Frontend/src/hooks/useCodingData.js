import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function useCodingData() {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: null, platforms: [], heatmapData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLiveStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5001/api/student/coding-stats/${user.uid}`);

      if (response.data.success) {
        setData({
          stats: response.data.stats,
          platforms: response.data.platforms,
          heatmapData: response.data.heatmapData
        });
      } else {
        setError("Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Error fetching coding stats:", err);
      setError("Critical error syncing external profiles.");
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    fetchLiveStats();
  }, [fetchLiveStats]);

  return { ...data, loading, error, refreshData: fetchLiveStats };
}