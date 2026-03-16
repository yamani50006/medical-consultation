import { startTransition, useEffect, useState } from "react";
import { listAdminAlerts, updateAdminAlertStatus } from "../features/admin/admin.api";
import { getErrorMessage } from "../utils/error";

export function useAdminAlertsData(initialFilters = { page: 1, limit: 12 }) {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (nextFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await listAdminAlerts(nextFilters);

      startTransition(() => {
        setItems(response.data.data || []);
        setMeta(response.data.meta || null);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل التنبيهات الإدارية."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
  }, [filters]);

  const updateStatus = async (id, status) => {
    try {
      await updateAdminAlertStatus(id, { status });
      await load(filters);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث حالة التنبيه."));
      throw err;
    }
  };

  return {
    filters,
    items,
    meta,
    loading,
    error,
    setFilters,
    reload: () => load(filters),
    updateStatus
  };
}
