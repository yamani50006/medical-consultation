import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude, safeUserSelect } from "./users.select.js";

export default class UsersRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  findSafeById(id) {
    return this.model.findUnique({
      where: { id },
      select: {
        ...safeUserSelect,
        patientProfile: true,
        doctorProfile: true
      }
    });
  }

  listUsers(where, { skip, limit }) {
    return this.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: safeUserSelect
    });
  }

  findPatientProfileByUserId(userId) {
    return prisma.patientProfile.findUnique({
      where: { userId },
      include: safePatientInclude
    });
  }

  findPatientProfileById(id) {
    return prisma.patientProfile.findUnique({
      where: { id },
      include: safePatientInclude
    });
  }

  findDoctorProfileByUserId(userId) {
    return prisma.doctorProfile.findUnique({
      where: { userId },
      include: safeDoctorInclude
    });
  }

  findDoctorProfileById(id) {
    return prisma.doctorProfile.findUnique({
      where: { id },
      include: safeDoctorInclude
    });
  }

  doctorHasPatientRelationship(doctorId, patientId) {
    return prisma.doctorProfile.findFirst({
      where: {
        id: doctorId,
        OR: [
          { consultations: { some: { patientId } } },
          { appointments: { some: { patientId } } },
          { treatmentPlans: { some: { patientId } } }
        ]
      },
      select: { id: true }
    });
  }
}
