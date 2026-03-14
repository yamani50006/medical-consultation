import ApiResponse from "../../core/base/ApiResponse.js";
import MedicationsService from "./medications.service.js";

class MedicationsController {
  constructor() {
    this.medicationsService = new MedicationsService();
  }

  addMedications = async (req, res, next) => {
    try {
      const result = await this.medicationsService.addMedications(
        req.user.userId,
        req.params.treatmentPlanId,
        req.body
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تمت إضافة الأدوية بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listTreatmentPlanMedications = async (req, res, next) => {
    try {
      const result = await this.medicationsService.listTreatmentPlanMedications(
        req.user.userId,
        req.user.role,
        req.params.treatmentPlanId
      );
      return ApiResponse.success(res, {
        message: "تم جلب الأدوية بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateMedication = async (req, res, next) => {
    try {
      const result = await this.medicationsService.updateMedication(
        req.user.userId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, {
        message: "تم تحديث الدواء بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  deleteMedication = async (req, res, next) => {
    try {
      const result = await this.medicationsService.deleteMedication(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "تم حذف الدواء بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new MedicationsController();
