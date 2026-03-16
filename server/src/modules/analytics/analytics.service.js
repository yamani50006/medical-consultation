import BaseService from "../../core/base/BaseService.js";
import { getStartOfDay, getStartOfWeek, addDays } from "../../core/utils/date.util.js";
import { deriveDoctorAccountStatus } from "../admin/admin.mapper.js";
import AnalyticsRepository from "./analytics.repository.js";

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function getResponseMinutes(item) {
  if (!item.doctorResponse) {
    return null;
  }

  return (new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime()) / 60000;
}

function percentageDelta(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export default class AnalyticsService extends BaseService {
  constructor(analyticsRepository = new AnalyticsRepository()) {
    super();
    this.analyticsRepository = analyticsRepository;
  }

  async getOverview() {
    const [doctors, consultations, reviews, patients] = await Promise.all([
      this.analyticsRepository.listDoctorProfiles(),
      this.analyticsRepository.listConsultationFacts(),
      this.analyticsRepository.listReviewFacts(),
      this.analyticsRepository.listPatientFacts()
    ]);

    const now = new Date();
    const todayStart = getStartOfDay(now);
    const weekStart = getStartOfWeek(now);

    const respondedMinutes = consultations
      .map(getResponseMinutes)
      .filter((value) => value !== null && Number.isFinite(value));

    const doctorsByStatus = doctors.reduce(
      (acc, doctor) => {
        const status = deriveDoctorAccountStatus(doctor);
        if (status in acc) {
          acc[status] += 1;
        }

        return acc;
      },
      {
        ACTIVE: 0,
        SUSPENDED: 0,
        PENDING: 0,
        REJECTED: 0
      }
    );

    const consultationsToday = consultations.filter((item) => new Date(item.createdAt) >= todayStart);
    const consultationsThisWeek = consultations.filter((item) => new Date(item.createdAt) >= weekStart);
    const patientIdsToday = new Set(consultationsToday.map((item) => item.patientId));
    const patientIdsThisWeek = new Set(consultationsThisWeek.map((item) => item.patientId));

    const patientMap = new Map(patients.map((patient) => [patient.id, patient]));
    const newPatientsThisWeek = [...patientIdsThisWeek].filter((patientId) => {
      const patient = patientMap.get(patientId);
      return patient && new Date(patient.createdAt) >= weekStart;
    }).length;

    const returningPatientsThisWeek = patientIdsThisWeek.size - newPatientsThisWeek;

    const specializationCounts = consultationsThisWeek.reduce((acc, item) => {
      const key = item.doctor?.specialization || "غير محدد";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const busiestHoursMap = consultationsThisWeek.reduce((acc, item) => {
      const hour = new Date(item.createdAt).getHours();
      const key = `${String(hour).padStart(2, "0")}:00`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      metrics: {
        totalDoctors: doctors.length,
        activeDoctors: doctorsByStatus.ACTIVE,
        suspendedDoctors: doctorsByStatus.SUSPENDED,
        pendingDoctors: doctorsByStatus.PENDING,
        consultationsToday: consultationsToday.length,
        consultationsThisWeek: consultationsThisWeek.length,
        patientsToday: patientIdsToday.size,
        patientsThisWeek: patientIdsThisWeek.size,
        averageDoctorRating: average(reviews.map((item) => item.rating)),
        averageResponseMinutes: average(respondedMinutes)
      },
      patientInsights: {
        uniquePatientsToday: patientIdsToday.size,
        uniquePatientsThisWeek: patientIdsThisWeek.size,
        newPatients: newPatientsThisWeek,
        returningPatients: Math.max(0, returningPatientsThisWeek)
      },
      demandInsights: {
        topSpecializations: Object.entries(specializationCounts)
          .sort((left, right) => right[1] - left[1])
          .slice(0, 5)
          .map(([specialization, total]) => ({ specialization, total })),
        busiestHours: Object.entries(busiestHoursMap)
          .sort((left, right) => right[1] - left[1])
          .slice(0, 6)
          .map(([hour, total]) => ({ hour, total }))
      }
    };
  }

  async getDoctorPerformance(doctorId) {
    const doctor = this.ensureFound(
      await this.analyticsRepository.findDoctorProfileById(doctorId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );

    const [consultations, reviews, appointments] = await Promise.all([
      this.analyticsRepository.listConsultationFacts({ doctorId }),
      this.analyticsRepository.listReviewFacts({ doctorId }),
      this.analyticsRepository.listAppointmentsFacts({ doctorId })
    ]);

    const now = new Date();
    const todayStart = getStartOfDay(now);
    const weekStart = getStartOfWeek(now);
    const previousWeekStart = addDays(weekStart, -7);

    const currentWeekConsultations = consultations.filter((item) => new Date(item.createdAt) >= weekStart);
    const previousWeekConsultations = consultations.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= previousWeekStart && createdAt < weekStart;
    });

    const respondedMinutes = consultations
      .map(getResponseMinutes)
      .filter((value) => value !== null && Number.isFinite(value));

    const uniquePatients = new Set(consultations.map((item) => item.patientId)).size;
    const currentWeekPatients = new Set(currentWeekConsultations.map((item) => item.patientId)).size;
    const previousWeekPatients = new Set(previousWeekConsultations.map((item) => item.patientId)).size;

    return {
      doctor: {
        id: doctor.id,
        fullName: doctor.user.fullName,
        email: doctor.user.email,
        specialization: doctor.specialization,
        city: doctor.city,
        region: doctor.region,
        accountStatus: deriveDoctorAccountStatus(doctor),
        joinedAt: doctor.createdAt,
        lastActivityAt: doctor.user.presence?.lastActiveAt || doctor.updatedAt
      },
      metrics: {
        totalConsultations: consultations.length,
        completedConsultations: consultations.filter((item) => item.status === "COMPLETED").length,
        cancelledConsultations: consultations.filter((item) => item.status === "CANCELLED").length,
        activeConsultations: consultations.filter((item) => ["PENDING", "ACCEPTED"].includes(item.status)).length,
        uniquePatients,
        averageRating: average(reviews.map((item) => item.rating)),
        averageResponseMinutes: average(respondedMinutes),
        consultationsToday: consultations.filter((item) => new Date(item.createdAt) >= todayStart).length,
        consultationsThisWeek: currentWeekConsultations.length,
        upcomingAppointments: appointments.filter(
          (item) => item.status === "SCHEDULED" && new Date(item.appointmentDate) >= now
        ).length
      },
      comparison: {
        currentWeekConsultations: currentWeekConsultations.length,
        previousWeekConsultations: previousWeekConsultations.length,
        consultationsDeltaPercentage: percentageDelta(
          currentWeekConsultations.length,
          previousWeekConsultations.length
        ),
        currentWeekPatients,
        previousWeekPatients,
        patientsDeltaPercentage: percentageDelta(currentWeekPatients, previousWeekPatients)
      }
    };
  }
}
