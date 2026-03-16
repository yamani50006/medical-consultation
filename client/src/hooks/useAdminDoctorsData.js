import { startTransition, useEffect, useState } from "react";
import {
  listAdminDoctors,
  reactivateDoctor,
  sendDoctorWarning,
  softDeleteDoctor,
  suspendDoctor,
  verifyDoctor
} from "../features/admin/admin.api";
import { getErrorMessage } from "../utils/error";

const initialFilters = {
  page: 1,
  limit: 12,
  search: "",
  status: "",
  specialization: "",
  city: "",
  sortBy: "joinedAt",
  sortOrder: "desc"
};

export function useAdminDoctorsData() {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const load = async (nextFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await listAdminDoctors(nextFilters);

      startTransition(() => {
        setItems(response.data.data || []);
        setMeta(response.data.meta || null);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل قائمة الأطباء."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
  }, [filters]);

  const performAction = async (doctorId, action) => {
    setActionLoadingId(doctorId);
    setError("");

    try {
      await action();
      await load(filters);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تنفيذ العملية على الطبيب."));
      throw err;
    } finally {
      setActionLoadingId("");
    }
  };

  return {
    filters,
    items,
    meta,
    loading,
    error,
    actionLoadingId,
    setFilters,
    reload: () => load(filters),
    suspendDoctor: (doctorId, payload) => performAction(doctorId, () => suspendDoctor(doctorId, payload)),
    reactivateDoctor: (doctorId, payload) => performAction(doctorId, () => reactivateDoctor(doctorId, payload)),
    verifyDoctor: (doctorId) => performAction(doctorId, () => verifyDoctor(doctorId)),
    softDeleteDoctor: (doctorId, payload) => performAction(doctorId, () => softDeleteDoctor(doctorId, payload)),
    sendWarning: (doctorId, payload) => performAction(doctorId, () => sendDoctorWarning(doctorId, payload))
  };
}
