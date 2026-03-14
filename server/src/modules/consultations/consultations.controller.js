import ApiResponse from "../../core/base/ApiResponse.js";
import ConsultationsService from "./consultations.service.js";

class ConsultationsController {
  constructor() {
    this.consultationsService = new ConsultationsService();
  }

  createConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.createConsultation(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Consultation request created successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listMyConsultations = async (req, res, next) => {
    try {
      const result = await this.consultationsService.listMyConsultations(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Patient consultations fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listAssignedConsultations = async (req, res, next) => {
    try {
      const result = await this.consultationsService.listAssignedConsultations(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Assigned consultations fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  respondToConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.respondToConsultation(
        req.user.userId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, {
        message: "Consultation response submitted successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateConsultationStatus = async (req, res, next) => {
    try {
      const result = await this.consultationsService.updateConsultationStatus(
        req.user.userId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, {
        message: "Consultation status updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new ConsultationsController();
