import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import UsersRepository from "./users.repository.js";

export default class UsersService extends BaseService {
  constructor() {
    super();
    this.usersRepository = new UsersRepository();
  }

  async getCurrentUser(userId) {
    const user = await this.usersRepository.findSafeById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return user;
  }

  async updateCurrentUser(userId, payload) {
    const user = await this.usersRepository.findSafeById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (payload.email && payload.email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(payload.email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError("Email is already registered", 409, "EMAIL_EXISTS");
      }
    }

    const nextData = {
      fullName: payload.fullName ?? user.fullName,
      email: payload.email ?? user.email
    };

    if (Object.prototype.hasOwnProperty.call(payload, "profileImageUrl")) {
      nextData.profileImageUrl = payload.profileImageUrl;
    }

    return this.usersRepository.updateSafeById(userId, nextData);
  }

  async listUsers(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.role) {
      where.role = query.role.toUpperCase();
    }

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      this.usersRepository.listUsers(where, { skip, limit }),
      this.usersRepository.count(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }
}
