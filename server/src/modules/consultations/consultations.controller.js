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

  requestConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.requestConsultation(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Consultation request created successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  quickMatchConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.quickMatchConsultation(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Quick consultation match created successfully",
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

  getConsultationById = async (req, res, next) => {
    try {
      const result = await this.consultationsService.getConsultationById(
        req.user.userId,
        req.user.role,
        req.params.id
      );
      return ApiResponse.success(res, {
        message: "Consultation fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  payConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.payConsultation(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "Consultation payment completed successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  archiveConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.archiveConsultation(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "Consultation archived successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  reopenConsultation = async (req, res, next) => {
    try {
      const result = await this.consultationsService.reopenConsultation(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "Consultation reopened successfully",
        data: result
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
