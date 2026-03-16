import ApiResponse from "../../core/base/ApiResponse.js";
import AdminService from "./admin.service.js";

class AdminController {
  constructor() {
    this.adminService = new AdminService();
  }

  listPendingDoctors = async (req, res, next) => {
    try {
      const result = await this.adminService.listPendingDoctors(req.query);
      return ApiResponse.success(res, {
        message: "Pending doctors fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listDoctors = async (req, res, next) => {
    try {
      const result = await this.adminService.listDoctors(req.query);
      return ApiResponse.success(res, {
        message: "Doctors fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  getDoctorDetails = async (req, res, next) => {
    try {
      const result = await this.adminService.getDoctorDetails(req.params.id);
      return ApiResponse.success(res, {
        message: "Doctor details fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  approveDoctor = async (req, res, next) => {
    try {
      const result = await this.adminService.approveDoctor(req.params.id, req.user.userId);
      return ApiResponse.success(res, {
        message: "Doctor approved successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  rejectDoctor = async (req, res, next) => {
    try {
      const result = await this.adminService.rejectDoctor(req.params.id, req.user.userId, req.body || {});
      return ApiResponse.success(res, {
        message: "Doctor rejected successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  suspendDoctor = async (req, res, next) => {
    try {
      const result = await this.adminService.suspendDoctor(req.params.id, req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Doctor suspended successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  reactivateDoctor = async (req, res, next) => {
    try {
      const result = await this.adminService.reactivateDoctor(req.params.id, req.user.userId, req.body || {});
      return ApiResponse.success(res, {
        message: "Doctor reactivated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  softDeleteDoctor = async (req, res, next) => {
    try {
      const result = await this.adminService.softDeleteDoctor(req.params.id, req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Doctor soft deleted successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  verifyDoctor = async (req, res, next) => {
    try {
      const result = await this.adminService.verifyDoctor(req.params.id, req.user.userId);
      return ApiResponse.success(res, {
        message: "Doctor verified successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateDoctorBasicInfo = async (req, res, next) => {
    try {
      const result = await this.adminService.updateDoctorBasicInfo(req.params.id, req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Doctor updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  sendDoctorWarning = async (req, res, next) => {
    try {
      const result = await this.adminService.sendDoctorWarning(req.params.id, req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Warning sent successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      const result = await this.adminService.listUsers(req.query);
      return ApiResponse.success(res, {
        message: "Users fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listPosts = async (req, res, next) => {
    try {
      const result = await this.adminService.listPosts(req.query);
      return ApiResponse.success(res, {
        message: "Posts fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listConsultations = async (req, res, next) => {
    try {
      const result = await this.adminService.listConsultations(req.query);
      return ApiResponse.success(res, {
        message: "Consultations fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listAppointments = async (req, res, next) => {
    try {
      const result = await this.adminService.listAppointments(req.query);
      return ApiResponse.success(res, {
        message: "Appointments fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new AdminController();
