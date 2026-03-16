import BaseService from "../../core/base/BaseService.js";
import { getStartOfWeek, addDays } from "../../core/utils/date.util.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import AlertsRepository from "./alerts.repository.js";

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default class AlertsService extends BaseService {
  constructor(alertsRepository = new AlertsRepository()) {
    super();
    this.alertsRepository = alertsRepository;
  }

  async listAlerts(query) {
    await this.refreshOperationalAlerts();

    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.severity) {
      where.severity = query.severity.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.alertsRepository.listAlerts(where, { skip, limit }),
      this.alertsRepository.countAlerts(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  updateAlertStatus(id, status, adminUserId) {
    return this.alertsRepository.updateAlertStatus(id, status.toUpperCase(), adminUserId);
  }

  async refreshOperationalAlerts() {
    const [doctors, consultations, reviews, upcomingAppointments] = await Promise.all([
      this.alertsRepository.listDoctorProfiles(),
      this.alertsRepository.listConsultationFacts(),
      this.alertsRepository.listReviewFacts(),
      this.alertsRepository.listUpcomingAppointments()
    ]);

    const now = new Date();
    const weekStart = getStartOfWeek(now);
    const previousWeekStart = addDays(weekStart, -7);
    const pendingThreshold = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const inactiveThreshold = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    const consultationsByDoctor = consultations.reduce((acc, item) => {
      acc[item.doctorId] ||= [];
      acc[item.doctorId].push(item);
      return acc;
    }, {});

    const reviewsByDoctor = reviews.reduce((acc, item) => {
      acc[item.doctorId] ||= [];
      acc[item.doctorId].push(item);
      return acc;
    }, {});

    const appointmentsByDoctor = upcomingAppointments.reduce((acc, item) => {
      acc[item.doctorId] ||= [];
      acc[item.doctorId].push(item);
      return acc;
    }, {});

    const activeFingerprints = [];
    const alertPayloads = [];

    for (const doctor of doctors) {
      const doctorConsultations = consultationsByDoctor[doctor.id] || [];
      const doctorReviews = reviewsByDoctor[doctor.id] || [];
      const weekConsultations = doctorConsultations.filter((item) => new Date(item.createdAt) >= weekStart);
      const previousWeekConsultations = doctorConsultations.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= previousWeekStart && createdAt < weekStart;
      });
      const avgRating = average(doctorReviews.map((item) => item.rating));
      const lowRatingsCount = doctorReviews.filter((item) => item.rating <= 2).length;
      const pendingUnanswered = doctorConsultations.filter(
        (item) => item.status === "PENDING" && !item.doctorResponse && new Date(item.createdAt) <= pendingThreshold
      ).length;
      const cancelledCount = weekConsultations.filter((item) => item.status === "CANCELLED").length;
      const cancellationRate = weekConsultations.length ? cancelledCount / weekConsultations.length : 0;
      const inactivityDrop =
        previousWeekConsultations.length >= 4 && weekConsultations.length <= Math.floor(previousWeekConsultations.length / 2);
      const isInactive =
        !doctor.user.presence?.lastActiveAt || new Date(doctor.user.presence.lastActiveAt) <= inactiveThreshold;

      if (doctorReviews.length >= 3 && avgRating < 3.5) {
        alertPayloads.push({
          fingerprint: `LOW_RATING:${doctor.id}`,
          type: "LOW_RATING",
          severity: avgRating < 2.5 ? "CRITICAL" : "HIGH",
          title: "انخفاض تقييم طبيب",
          message: `تقييم الطبيب ${doctor.user.fullName} انخفض إلى ${avgRating.toFixed(1)}.`,
          targetDoctorId: doctor.id,
          relatedEntityType: "doctor_profile",
          relatedEntityId: doctor.id,
          metadata: { averageRating: avgRating, totalReviews: doctorReviews.length }
        });
      }

      if (lowRatingsCount >= 3) {
        alertPayloads.push({
          fingerprint: `HIGH_COMPLAINTS:${doctor.id}`,
          type: "HIGH_COMPLAINTS",
          severity: "HIGH",
          title: "ارتفاع الشكاوى المحتملة",
          message: `الطبيب ${doctor.user.fullName} لديه ${lowRatingsCount} تقييمات منخفضة.`,
          targetDoctorId: doctor.id,
          relatedEntityType: "doctor_profile",
          relatedEntityId: doctor.id,
          metadata: { lowRatingsCount }
        });
      }

      if (pendingUnanswered >= 3) {
        alertPayloads.push({
          fingerprint: `MULTIPLE_PENDING_RESPONSES:${doctor.id}`,
          type: "MULTIPLE_PENDING_RESPONSES",
          severity: pendingUnanswered >= 5 ? "CRITICAL" : "HIGH",
          title: "استشارات بلا رد",
          message: `الطبيب ${doctor.user.fullName} لم يرد على ${pendingUnanswered} استشارات معلقة.`,
          targetDoctorId: doctor.id,
          relatedEntityType: "doctor_profile",
          relatedEntityId: doctor.id,
          metadata: { pendingUnanswered }
        });
      }

      if (weekConsultations.length >= 5 && cancellationRate >= 0.35) {
        alertPayloads.push({
          fingerprint: `HIGH_CANCELLATION_RATE:${doctor.id}`,
          type: "HIGH_CANCELLATION_RATE",
          severity: cancellationRate >= 0.5 ? "CRITICAL" : "HIGH",
          title: "ارتفاع معدل الإلغاء",
          message: `معدل إلغاء الطبيب ${doctor.user.fullName} وصل إلى ${(cancellationRate * 100).toFixed(0)}%.`,
          targetDoctorId: doctor.id,
          relatedEntityType: "doctor_profile",
          relatedEntityId: doctor.id,
          metadata: { cancellationRate, cancelledCount, weekConsultations: weekConsultations.length }
        });
      }

      if (isInactive || inactivityDrop) {
        alertPayloads.push({
          fingerprint: `INACTIVITY_DROP:${doctor.id}`,
          type: "INACTIVITY_DROP",
          severity: "MEDIUM",
          title: "انخفاض نشاط طبيب",
          message: `نشاط الطبيب ${doctor.user.fullName} منخفض مقارنة بالأسبوع الماضي أو لم يسجل نشاطًا مؤخرًا.`,
          targetDoctorId: doctor.id,
          relatedEntityType: "doctor_profile",
          relatedEntityId: doctor.id,
          metadata: {
            weekConsultations: weekConsultations.length,
            previousWeekConsultations: previousWeekConsultations.length,
            lastActiveAt: doctor.user.presence?.lastActiveAt || null
          }
        });
      }

      if (doctor.user.status === "SUSPENDED" && (appointmentsByDoctor[doctor.id] || []).length > 0) {
        alertPayloads.push({
          fingerprint: `SUSPENDED_DOCTOR_UPCOMING_APPOINTMENTS:${doctor.id}`,
          type: "SUSPENDED_DOCTOR_UPCOMING_APPOINTMENTS",
          severity: "CRITICAL",
          title: "طبيب موقوف لديه مواعيد قادمة",
          message: `الطبيب ${doctor.user.fullName} موقوف وما زالت لديه مواعيد قادمة.`,
          targetDoctorId: doctor.id,
          relatedEntityType: "doctor_profile",
          relatedEntityId: doctor.id,
          metadata: {
            upcomingAppointments: (appointmentsByDoctor[doctor.id] || []).length
          }
        });
      }
    }

    const specializationThisWeek = consultations
      .filter((item) => new Date(item.createdAt) >= weekStart)
      .reduce((acc, item) => {
        const specialization = item.doctor?.specialization || "غير محدد";
        acc[specialization] = (acc[specialization] || 0) + 1;
        return acc;
      }, {});

    const specializationPreviousWeek = consultations
      .filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= previousWeekStart && createdAt < weekStart;
      })
      .reduce((acc, item) => {
        const specialization = item.doctor?.specialization || "غير محدد";
        acc[specialization] = (acc[specialization] || 0) + 1;
        return acc;
      }, {});

    Object.entries(specializationThisWeek).forEach(([specialization, count]) => {
      const previous = specializationPreviousWeek[specialization] || 0;
      if (count >= 6 && (previous === 0 || count >= previous * 1.5)) {
        alertPayloads.push({
          fingerprint: `SPECIALIZATION_DEMAND_SPIKE:${specialization}`,
          type: "SPECIALIZATION_DEMAND_SPIKE",
          severity: count >= 12 ? "HIGH" : "MEDIUM",
          title: "ارتفاع الطلب على تخصص",
          message: `هناك ارتفاع واضح في الطلب على تخصص ${specialization}.`,
          relatedEntityType: "specialization",
          relatedEntityId: specialization,
          metadata: {
            currentWeek: count,
            previousWeek: previous
          }
        });
      }
    });

    for (const payload of alertPayloads) {
      activeFingerprints.push(payload.fingerprint);
      await this.alertsRepository.upsertAlert(payload);
    }

    await this.alertsRepository.resolveAlertsNotInFingerprints(activeFingerprints);
  }
}
