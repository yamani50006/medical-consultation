import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import UsersRepository from "../users/users.repository.js";
import GroupsRepository from "./groups.repository.js";

export default class GroupsService extends BaseService {
  constructor() {
    super();
    this.groupsRepository = new GroupsRepository();
    this.usersRepository = new UsersRepository();
    this.notificationsService = new NotificationsService();
  }

  async createGroup(userId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );

    return this.groupsRepository.createGroup({
      name: payload.name,
      description: payload.description,
      category: payload.category,
      visibility: payload.visibility.toUpperCase(),
      createdByDoctorId: doctor.id
    });
  }

  async listGroups(userId, role, query) {
    if (role === "PATIENT") {
      const patient = this.ensureFound(
        await this.usersRepository.findPatientProfileByUserId(userId),
        "Patient profile not found",
        "PATIENT_PROFILE_NOT_FOUND"
      );

      return this.listPatientGroups(patient.id, query, false);
    }

    if (role === "DOCTOR") {
      const doctor = this.ensureFound(
        await this.usersRepository.findDoctorProfileByUserId(userId),
        "Doctor profile not found",
        "DOCTOR_PROFILE_NOT_FOUND"
      );

      return this.listDoctorGroups(doctor.id, query);
    }

    return this.listAdminGroups(query);
  }

  async listMyGroups(userId, role, query) {
    if (role === "PATIENT") {
      const patient = this.ensureFound(
        await this.usersRepository.findPatientProfileByUserId(userId),
        "Patient profile not found",
        "PATIENT_PROFILE_NOT_FOUND"
      );

      return this.listPatientGroups(patient.id, query, true);
    }

    if (role === "DOCTOR") {
      const doctor = this.ensureFound(
        await this.usersRepository.findDoctorProfileByUserId(userId),
        "Doctor profile not found",
        "DOCTOR_PROFILE_NOT_FOUND"
      );

      return this.listDoctorGroups(doctor.id, query);
    }

    return this.listAdminGroups(query);
  }

  async getGroupById(userId, role, groupId) {
    let patientId;
    let doctorId;

    if (role === "PATIENT") {
      const patient = this.ensureFound(
        await this.usersRepository.findPatientProfileByUserId(userId),
        "Patient profile not found",
        "PATIENT_PROFILE_NOT_FOUND"
      );
      patientId = patient.id;
    }

    if (role === "DOCTOR") {
      const doctor = this.ensureFound(
        await this.usersRepository.findDoctorProfileByUserId(userId),
        "Doctor profile not found",
        "DOCTOR_PROFILE_NOT_FOUND"
      );
      doctorId = doctor.id;
    }

    const group = this.ensureFound(
      await this.groupsRepository.findDetailedById(groupId, patientId),
      "Group not found",
      "GROUP_NOT_FOUND"
    );

    if (role === "PATIENT") {
      this.ensure(
        group.visibility === "PUBLIC" || group.memberships.length > 0,
        "You can only access public groups or groups you have joined",
        403,
        "GROUP_FORBIDDEN"
      );
    }

    if (role === "DOCTOR") {
      this.ensure(
        group.createdByDoctorId === doctorId,
        "You can only access groups you created",
        403,
        "GROUP_FORBIDDEN"
      );
    }

    return {
      ...group,
      isJoined: patientId ? group.memberships.length > 0 : undefined
    };
  }

  async joinGroup(userId, groupId) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const group = this.ensureFound(
      await this.groupsRepository.findDetailedById(groupId, patient.id),
      "Group not found",
      "GROUP_NOT_FOUND"
    );
    const existingMembership = await this.groupsRepository.findMembership(groupId, patient.id);

    if (existingMembership) {
      return existingMembership;
    }

    return this.groupsRepository.createMembership(group.id, patient.id);
  }

  async updateGroup(userId, groupId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const group = this.ensureFound(
      await this.groupsRepository.findDetailedById(groupId),
      "Group not found",
      "GROUP_NOT_FOUND"
    );

    this.ensure(
      group.createdByDoctorId === doctor.id,
      "You can only update your own groups",
      403,
      "GROUP_FORBIDDEN"
    );

    return this.groupsRepository.updateGroup(groupId, {
      name: payload.name ?? group.name,
      description: payload.description ?? group.description,
      category: payload.category ?? group.category,
      visibility: payload.visibility ? payload.visibility.toUpperCase() : group.visibility
    });
  }

  async createGroupPost(userId, groupId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const group = this.ensureFound(
      await this.groupsRepository.findDetailedById(groupId),
      "Group not found",
      "GROUP_NOT_FOUND"
    );

    this.ensure(
      group.createdByDoctorId === doctor.id,
      "Only the group owner can publish posts",
      403,
      "GROUP_POST_FORBIDDEN"
    );

    const post = await this.groupsRepository.createGroupPost({
      groupId,
      doctorId: doctor.id,
      title: payload.title,
      content: payload.content
    });

    const members = await this.groupsRepository.listGroupMemberUserIds(groupId);
    await this.notificationsService.createForUsers(
      members.map((item) => item.patient.userId),
      {
        type: "GROUP_POST_PUBLISHED",
        title: "منشور جديد في المجموعة",
        message: `شارك ${doctor.user.fullName} منشوراً تعليمياً جديداً في مجموعة ${group.name}.`
      }
    );

    return post;
  }

  async updateGroupPost(userId, postId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const post = this.ensureFound(
      await this.groupsRepository.findGroupPostById(postId),
      "Group post not found",
      "GROUP_POST_NOT_FOUND"
    );

    this.ensure(
      post.group.createdByDoctorId === doctor.id,
      "Only the group owner can update group posts",
      403,
      "GROUP_POST_FORBIDDEN"
    );

    return this.groupsRepository.updateGroupPost(postId, {
      title: payload.title ?? post.title,
      content: payload.content ?? post.content
    });
  }

  async listPatientGroups(patientId, query, joinedOnly) {
    const { page, limit, skip } = this.getPagination(query);
    const where = this.buildPatientGroupsWhere(patientId, query, joinedOnly);

    const [items, total] = await Promise.all([
      this.groupsRepository.listPatientGroups(patientId, where, { skip, limit }),
      this.groupsRepository.count(where)
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        isJoined: item.memberships.length > 0
      })),
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listDoctorGroups(doctorId, query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = this.buildGenericGroupsWhere(query);

    const [items, total] = await Promise.all([
      this.groupsRepository.listDoctorGroups(doctorId, where, { skip, limit }),
      this.groupsRepository.count({ createdByDoctorId: doctorId, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listAdminGroups(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = this.buildGenericGroupsWhere(query);

    const [items, total] = await Promise.all([
      this.groupsRepository.listAllGroups(where, { skip, limit }),
      this.groupsRepository.count(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  buildPatientGroupsWhere(patientId, query, joinedOnly) {
    const filters = [];

    if (joinedOnly) {
      filters.push({
        memberships: {
          some: {
            patientId
          }
        }
      });
    } else {
      filters.push({
        OR: [
          { visibility: "PUBLIC" },
          {
            memberships: {
              some: {
                patientId
              }
            }
          }
        ]
      });
    }

    const genericWhere = this.buildGenericGroupsWhere(query);
    if (Object.keys(genericWhere).length > 0) {
      filters.push(genericWhere);
    }

    return filters.length === 1 ? filters[0] : { AND: filters };
  }

  buildGenericGroupsWhere(query) {
    const filters = [];

    if (query.visibility) {
      filters.push({
        visibility: query.visibility.toUpperCase()
      });
    }

    if (query.category) {
      filters.push({
        category: {
          contains: query.category,
          mode: "insensitive"
        }
      });
    }

    if (query.search) {
      filters.push({
        OR: [
          {
            name: {
              contains: query.search,
              mode: "insensitive"
            }
          },
          {
            description: {
              contains: query.search,
              mode: "insensitive"
            }
          },
          {
            category: {
              contains: query.search,
              mode: "insensitive"
            }
          }
        ]
      });
    }

    if (filters.length === 0) {
      return {};
    }

    return filters.length === 1 ? filters[0] : { AND: filters };
  }
}
