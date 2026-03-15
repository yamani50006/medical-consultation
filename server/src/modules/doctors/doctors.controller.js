import ApiResponse from "../../core/base/ApiResponse.js";
import DoctorsService from "./doctors.service.js";

class DoctorsController {
  constructor() {
    this.doctorsService = new DoctorsService();
  }

  listDoctors = async (req, res, next) => {
    try {
      const result = await this.doctorsService.listDoctors(req.query);
      return ApiResponse.success(res, {
        message: "Doctors fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listRecommendedDoctors = async (req, res, next) => {
    try {
      const result = await this.doctorsService.getRecommendedDoctors(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Recommended doctors fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getDoctorFilters = async (req, res, next) => {
    try {
      const result = await this.doctorsService.getDoctorFilters();
      return ApiResponse.success(res, {
        message: "Doctor filters fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getDoctorById = async (req, res, next) => {
    try {
      const result = await this.doctorsService.getDoctorById(req.params.id);
      return ApiResponse.success(res, {
        message: "Doctor fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getMyProfile = async (req, res, next) => {
    try {
      const result = await this.doctorsService.getMyProfile(req.user.userId);
      return ApiResponse.success(res, {
        message: "Doctor profile fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateMyProfile = async (req, res, next) => {
    try {
      const result = await this.doctorsService.updateMyProfile(req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Doctor profile updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new DoctorsController();
