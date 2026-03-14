import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

const safeUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

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
}
