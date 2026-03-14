import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude } from "../users/users.select.js";

const groupListInclude = (patientId) => ({
  createdByDoctor: {
    include: safeDoctorInclude
  },
  memberships: patientId
    ? {
        where: {
          patientId
        },
        select: {
          id: true,
          joinedAt: true
        }
      }
    : {
        select: {
          id: true
        }
      },
  _count: {
    select: {
      memberships: true,
      posts: true
    }
  }
});

const groupDetailInclude = (patientId) => ({
  createdByDoctor: {
    include: safeDoctorInclude
  },
  memberships: patientId
    ? {
        where: {
          patientId
        },
        include: {
          patient: {
            include: safePatientInclude
          }
        }
      }
    : {
        include: {
          patient: {
            include: safePatientInclude
          }
        }
      },
  posts: {
    orderBy: {
      createdAt: "desc"
    },
    include: {
      doctor: {
        include: safeDoctorInclude
      }
    }
  },
  _count: {
    select: {
      memberships: true,
      posts: true
    }
  }
});

export default class GroupsRepository extends BaseRepository {
  constructor() {
    super(prisma.group);
  }

  createGroup(data) {
    return this.model.create({
      data,
      include: groupDetailInclude()
    });
  }

  updateGroup(id, data) {
    return this.model.update({
      where: { id },
      data,
      include: groupDetailInclude()
    });
  }

  listPatientGroups(patientId, where, { skip, limit }) {
    return this.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: groupListInclude(patientId)
    });
  }

  listDoctorGroups(doctorId, where, { skip, limit }) {
    return this.model.findMany({
      where: {
        createdByDoctorId: doctorId,
        ...where
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: groupListInclude()
    });
  }

  listAllGroups(where, { skip, limit }) {
    return this.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: groupListInclude()
    });
  }

  findDetailedById(id, patientId) {
    return this.model.findUnique({
      where: { id },
      include: groupDetailInclude(patientId)
    });
  }

  findMembership(groupId, patientId) {
    return prisma.groupMembership.findUnique({
      where: {
        groupId_patientId: {
          groupId,
          patientId
        }
      },
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }

  createMembership(groupId, patientId) {
    return prisma.groupMembership.create({
      data: {
        groupId,
        patientId
      },
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }

  createGroupPost(data) {
    return prisma.groupPost.create({
      data,
      include: {
        group: {
          include: groupDetailInclude()
        },
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  findGroupPostById(id) {
    return prisma.groupPost.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            createdByDoctor: {
              include: safeDoctorInclude
            }
          }
        },
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  updateGroupPost(id, data) {
    return prisma.groupPost.update({
      where: { id },
      data,
      include: {
        group: {
          include: groupDetailInclude()
        },
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  listGroupMemberUserIds(groupId) {
    return prisma.groupMembership.findMany({
      where: { groupId },
      select: {
        patient: {
          select: {
            userId: true
          }
        }
      }
    });
  }
}
