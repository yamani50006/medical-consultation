import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import PostsRepository from "./posts.repository.js";

export default class PostsService extends BaseService {
  constructor() {
    super();
    this.postsRepository = new PostsRepository();
  }

  async createPost(userId, payload) {
    const doctor = await this.postsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (doctor.approvalStatus !== "APPROVED" || doctor.user.status !== "ACTIVE") {
      throw new AppError("Only approved doctors can create posts", 403, "DOCTOR_NOT_APPROVED");
    }

    return this.postsRepository.create({
      doctorId: doctor.id,
      title: payload.title,
      content: payload.content,
      specialization: payload.specialization,
      status: payload.status?.toUpperCase() || "PUBLISHED"
    });
  }

  async updateOwnPost(userId, postId, payload) {
    const post = await this.postsRepository.findPostWithDoctor(postId);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    if (post.doctor.user.id !== userId) {
      throw new AppError("You can only update your own posts", 403, "POST_FORBIDDEN");
    }

    return this.postsRepository.update(postId, {
      title: payload.title ?? post.title,
      content: payload.content ?? post.content,
      specialization: payload.specialization ?? post.specialization,
      status: payload.status ? payload.status.toUpperCase() : post.status
    });
  }

  async deleteOwnPost(userId, postId) {
    const post = await this.postsRepository.findPostWithDoctor(postId);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    if (post.doctor.user.id !== userId) {
      throw new AppError("You can only delete your own posts", 403, "POST_FORBIDDEN");
    }

    await this.postsRepository.delete(postId);
    return { id: postId };
  }

  async listPublicPosts(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {
      status: "PUBLISHED"
    };

    if (query.specialization) {
      where.specialization = { contains: query.specialization, mode: "insensitive" };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      this.postsRepository.listPosts(where, { skip, limit }),
      this.postsRepository.count(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listMyPosts(userId, query) {
    const doctor = await this.postsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      this.postsRepository.listDoctorPosts(doctor.id, where, { skip, limit }),
      this.postsRepository.count({ doctorId: doctor.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }
}
