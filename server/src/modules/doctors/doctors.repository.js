import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeUserSelect } from "../users/users.select.js";

const doctorProfileInclude = {
  user: {
    select: safeUserSelect
  },
  availabilitySlots: {
    orderBy: [{ weekday: "asc" }, { time: "asc" }]
  }
};

export default class DoctorsRepository extends BaseRepository {
  constructor() {
    super(prisma.doctorProfile);
  }

  listApprovedDoctors(where, { skip, limit }) {
    return this.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: doctorProfileInclude
    });
  }

  findApprovedById(id) {
    return this.model.findFirst({
      where: {
        id,
        approvalStatus: "APPROVED",
        deletedAt: null,
        acceptingNewConsultations: true,
        user: { status: "ACTIVE" }
      },
      include: doctorProfileInclude
    });
  }

  findByUserId(userId) {
    return this.model.findUnique({
      where: { userId },
      include: doctorProfileInclude
    });
  }

  updateByUserId(userId, data) {
    return this.model.update({
      where: { userId },
      data,
      include: doctorProfileInclude
    });
  }
}
