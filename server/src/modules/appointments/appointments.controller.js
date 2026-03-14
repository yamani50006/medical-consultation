import ApiResponse from "../../core/base/ApiResponse.js";
import AppointmentsService from "./appointments.service.js";

class AppointmentsController {
  constructor() {
    this.appointmentsService = new AppointmentsService();
  }

  bookAppointment = async (req, res, next) => {
    try {
      const result = await this.appointmentsService.bookAppointment(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Appointment booked successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listMyAppointments = async (req, res, next) => {
    try {
      const result = await this.appointmentsService.listMyAppointments(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Patient appointments fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listDoctorAppointments = async (req, res, next) => {
    try {
      const result = await this.appointmentsService.listDoctorAppointments(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Doctor appointments fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  updateAppointmentStatus = async (req, res, next) => {
    try {
      const result = await this.appointmentsService.updateAppointmentStatus(
        req.user.userId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, {
        message: "Appointment status updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new AppointmentsController();
