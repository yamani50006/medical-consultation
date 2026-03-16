import { startTransition, useEffect, useState } from "react";
import { getAdminAnalyticsOverview, listAdminAlerts } from "../features/admin/admin.api";
import { getErrorMessage } from "../utils/error";

export function useAdminDashboardData() {
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewResponse, alertsResponse] = await Promise.all([
        getAdminAnalyticsOverview(),
        listAdminAlerts({ page: 1, limit: 6 })
      ]);

      startTransition(() => {
        setOverview(overviewResponse.data.data);
        setAlerts(alertsResponse.data.data || []);
        setMeta(alertsResponse.data.meta || null);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل بيانات لوحة الإدارة."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    overview,
    alerts,
    alertsMeta: meta,
    loading,
    error,
    reload: load
  };
}
