import prisma from "../../config/db.js";
import { safeUserSelect } from "../users/users.select.js";

export default class RecommendationsRepository {
  findRecommendationCandidates(where) {
    return prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: safeUserSelect
        },
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });
  }

  findPatientProfileByUserId(userId) {
    return prisma.patientProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        city: true,
        region: true
      }
    });
  }

  findDoctorFilterValues() {
    return prisma.doctorProfile.findMany({
      where: {
        approvalStatus: "APPROVED",
        user: {
          status: "ACTIVE"
        }
      },
      select: {
        specialization: true,
        city: true,
        region: true,
        consultationFee: true
      }
    });
  }
}
