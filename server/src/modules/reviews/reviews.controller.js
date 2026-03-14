import ApiResponse from "../../core/base/ApiResponse.js";
import ReviewsService from "./reviews.service.js";

class ReviewsController {
  constructor() {
    this.reviewsService = new ReviewsService();
  }

  createReview = async (req, res, next) => {
    try {
      const result = await this.reviewsService.createReview(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تم إنشاء التقييم بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listEligibleReviewTargets = async (req, res, next) => {
    try {
      const result = await this.reviewsService.listEligibleReviewTargets(req.user.userId);
      return ApiResponse.success(res, {
        message: "تم جلب العناصر المتاحة للتقييم بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listMyReviews = async (req, res, next) => {
    try {
      const result = await this.reviewsService.listMyReviews(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب تقييمات المريض بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listDoctorReviews = async (req, res, next) => {
    try {
      const result = await this.reviewsService.listDoctorReviews(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب تقييمات الطبيب بنجاح",
        data: result.items,
        meta: {
          ...result.meta,
          summary: result.summary
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  listPublicDoctorReviews = async (req, res, next) => {
    try {
      const result = await this.reviewsService.listPublicDoctorReviews(req.params.doctorId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب تقييمات الطبيب بنجاح",
        data: result.items,
        meta: {
          ...result.meta,
          summary: result.summary
        }
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new ReviewsController();
