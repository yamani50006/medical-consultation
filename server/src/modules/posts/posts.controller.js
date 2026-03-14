import ApiResponse from "../../core/base/ApiResponse.js";
import PostsService from "./posts.service.js";

class PostsController {
  constructor() {
    this.postsService = new PostsService();
  }

  createPost = async (req, res, next) => {
    try {
      const result = await this.postsService.createPost(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Post created successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateOwnPost = async (req, res, next) => {
    try {
      const result = await this.postsService.updateOwnPost(req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, {
        message: "Post updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  deleteOwnPost = async (req, res, next) => {
    try {
      const result = await this.postsService.deleteOwnPost(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "Post deleted successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listPublicPosts = async (req, res, next) => {
    try {
      const result = await this.postsService.listPublicPosts(req.query);
      return ApiResponse.success(res, {
        message: "Posts fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listMyPosts = async (req, res, next) => {
    try {
      const result = await this.postsService.listMyPosts(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Doctor posts fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new PostsController();
