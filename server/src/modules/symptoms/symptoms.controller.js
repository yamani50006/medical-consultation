import ApiResponse from "../../core/base/ApiResponse.js";
import SymptomAnalyzerService from "./symptoms.service.js";

class SymptomsController {
  constructor() {
    this.symptomAnalyzerService = new SymptomAnalyzerService();
  }

  analyzeSymptoms = async (req, res, next) => {
    try {
      const result = await this.symptomAnalyzerService.analyzeSymptoms(req.body);
      return ApiResponse.success(res, {
        message: "Symptoms analyzed successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new SymptomsController();
