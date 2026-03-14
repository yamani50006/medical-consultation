import ApiResponse from "../../core/base/ApiResponse.js";
import AuthService from "./auth.service.js";

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  registerPatient = async (req, res, next) => {
    try {
      const result = await this.authService.registerPatient(req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Patient registered successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  registerDoctor = async (req, res, next) => {
    try {
      const result = await this.authService.registerDoctor(req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Doctor registered and awaiting admin approval",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);
      return ApiResponse.success(res, {
        message: "Login successful",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.authService.getMe(req.user.userId);
      return ApiResponse.success(res, {
        message: "Current user fetched successfully",
        data: user
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new AuthController();
