import ApiResponse from "../../core/base/ApiResponse.js";
import DoctorScheduleService from "./doctorSchedule.service.js";

class DoctorScheduleController {
  constructor() {
    this.doctorScheduleService = new DoctorScheduleService();
  }

  setDailySchedule = async (req, res, next) => {
    try {
      const result = await this.doctorScheduleService.setDailySchedule(req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Daily schedule set successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getDailySchedule = async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const result = await this.doctorScheduleService.getDailySchedule(doctorId, date);
      return ApiResponse.success(res, {
        message: "Daily schedule fetched successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  listMySchedules = async (req, res, next) => {
    try {
      const result = await this.doctorScheduleService.getMySchedules(req.user.userId);
      return ApiResponse.success(res, {
        message: "My schedules fetched successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMySchedule = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.doctorScheduleService.deleteMySchedule(req.user.userId, id);
      return ApiResponse.success(res, {
        message: "Schedule deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  updateMySchedule = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.doctorScheduleService.updateMySchedule(req.user.userId, id, req.body);
      return ApiResponse.success(res, {
        message: "Schedule updated successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}



export default new DoctorScheduleController();

