import ApiResponse from "../../core/base/ApiResponse.js";
import MedicalRecordsService from "./medicalRecords.service.js";

class MedicalRecordsController {
  constructor() {
    this.medicalRecordsService = new MedicalRecordsService();
  }

  getMyMedicalRecord = async (req, res, next) => {
    try {
      const result = await this.medicalRecordsService.getMyMedicalRecord(req.user.userId);
      return ApiResponse.success(res, {
        message: "تم جلب السجل الطبي بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateMyMedicalRecord = async (req, res, next) => {
    try {
      const result = await this.medicalRecordsService.updateMyMedicalRecord(req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "تم تحديث السجل الطبي بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getPatientMedicalRecord = async (req, res, next) => {
    try {
      const result = await this.medicalRecordsService.getPatientMedicalRecord(
        req.user.userId,
        req.user.role,
        req.params.patientId
      );
      return ApiResponse.success(res, {
        message: "تم جلب السجل الطبي للمريض بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new MedicalRecordsController();
