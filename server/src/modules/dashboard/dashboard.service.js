import BaseService from "../../core/base/BaseService.js";
import { getEndOfDay, getStartOfDay } from "../../core/utils/date.util.js";
import UsersRepository from "../users/users.repository.js";
import DashboardRepository from "./dashboard.repository.js";

export default class DashboardService extends BaseService {
  constructor() {
    super();
    this.dashboardRepository = new DashboardRepository();
    this.usersRepository = new UsersRepository();
  }

  async getPatientDashboard(userId) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const now = new Date();

    const [activeTreatmentPlans, recentConsultations, upcomingAppointments, recentNotifications, joinedGroups] =
      await Promise.all([
        this.dashboardRepository.listPatientActiveTreatmentPlans(patient.id),
        this.dashboardRepository.listRecentConsultations(patient.id),
        this.dashboardRepository.listUpcomingAppointments(patient.id, now),
        this.dashboardRepository.listRecentNotifications(userId),
        this.dashboardRepository.listJoinedGroups(patient.id)
      ]);

    return {
      activeTreatmentPlans,
      recentConsultations,
      upcomingAppointments,
      recentNotifications,
      joinedGroups: joinedGroups.map((item) => item.group)
    };
  }

  async getDoctorDashboard(userId) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const todayRange = {
      gte: getStartOfDay(),
      lte: getEndOfDay()
    };

    const [todayAppointments, pendingConsultations, activeTreatmentPlansCount, recentPatientFollowUps, latestReviews] =
      await Promise.all([
        this.dashboardRepository.listTodayAppointments(doctor.id, todayRange),
        this.dashboardRepository.listPendingConsultations(doctor.id),
        this.dashboardRepository.countActiveTreatmentPlans(doctor.id),
        this.dashboardRepository.listRecentPatientFollowUps(doctor.id),
        this.dashboardRepository.listLatestReviews(doctor.id)
      ]);

    return {
      todayAppointments,
      pendingConsultations,
      activeTreatmentPlansCount,
      recentPatientFollowUps,
      latestReviews
    };
  }

  async getAdminDashboard() {
    const [
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalConsultations,
      totalAppointments,
      totalTreatmentPlans,
      totalGroups
    ] = await this.dashboardRepository.getAdminOverviewCounts();

    return {
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalConsultations,
      totalAppointments,
      totalTreatmentPlans,
      totalGroups
    };
  }

  async getAdminAnalytics() {
    const [overview, consultations, appointments, treatmentPlans, groups, reviewSnapshot, topRatedDoctors] =
      await Promise.all([
        this.getAdminDashboard(),
        this.dashboardRepository.getConsultationStatusBreakdown(),
        this.dashboardRepository.getAppointmentStatusBreakdown(),
        this.dashboardRepository.getTreatmentPlanStatusBreakdown(),
        this.dashboardRepository.getGroupVisibilityBreakdown(),
        this.dashboardRepository.getReviewSnapshot(),
        this.dashboardRepository.getTopRatedDoctors()
      ]);

    return {
      overview,
      consultationStatusBreakdown: consultations.map((item) => ({
        status: item.status,
        count: item._count._all
      })),
      appointmentStatusBreakdown: appointments.map((item) => ({
        status: item.status,
        count: item._count._all
      })),
      treatmentPlanStatusBreakdown: treatmentPlans.map((item) => ({
        status: item.status,
        count: item._count._all
      })),
      groupVisibilityBreakdown: groups.map((item) => ({
        visibility: item.visibility,
        count: item._count._all
      })),
      reviewSnapshot: {
        averageRating: reviewSnapshot._avg.rating ? Number(reviewSnapshot._avg.rating.toFixed(1)) : 0,
        totalReviews: reviewSnapshot._count._all
      },
      topRatedDoctors
    };
  }
}
