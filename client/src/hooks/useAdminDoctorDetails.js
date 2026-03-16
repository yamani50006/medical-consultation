import { startTransition, useEffect, useState } from "react";
import {
  getAdminDoctorDetails,
  getDoctorPerformance,
  reactivateDoctor,
  sendDoctorWarning,
  softDeleteDoctor,
  suspendDoctor,
  updateDoctorBasicInfo,
  verifyDoctor
} from "../features/admin/admin.api";
import { getErrorMessage } from "../utils/error";

export function useAdminDoctorDetails(doctorId) {
  const [doctor, setDoctor] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!doctorId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [doctorResponse, performanceResponse] = await Promise.all([
        getAdminDoctorDetails(doctorId),
        getDoctorPerformance(doctorId)
      ]);

      startTransition(() => {
        setDoctor(doctorResponse.data.data);
        setPerformance(performanceResponse.data.data);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل تفاصيل الطبيب."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [doctorId]);

  const performAction = async (callback) => {
    setSaving(true);
    setError("");

    try {
      await callback();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تنفيذ العملية."));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    doctor,
    performance,
    loading,
    saving,
    error,
    reload: load,
    suspendDoctor: (payload) => performAction(() => suspendDoctor(doctorId, payload)),
    reactivateDoctor: (payload) => performAction(() => reactivateDoctor(doctorId, payload)),
    verifyDoctor: () => performAction(() => verifyDoctor(doctorId)),
    softDeleteDoctor: (payload) => performAction(() => softDeleteDoctor(doctorId, payload)),
    updateBasicInfo: (payload) => performAction(() => updateDoctorBasicInfo(doctorId, payload)),
    sendWarning: (payload) => performAction(() => sendDoctorWarning(doctorId, payload))
  };
}
