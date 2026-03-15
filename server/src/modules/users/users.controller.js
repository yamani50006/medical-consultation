import ApiResponse from "../../core/base/ApiResponse.js";
import UsersService from "./users.service.js";

class UsersController {
  constructor() {
    this.usersService = new UsersService();
  }

  me = async (req, res, next) => {
    try {
      const user = await this.usersService.getCurrentUser(req.user.userId);
      return ApiResponse.success(res, {
        message: "User fetched successfully",
        data: user
      });
    } catch (error) {
      return next(error);
    }
  };

  updateMe = async (req, res, next) => {
    try {
      const user = await this.usersService.updateCurrentUser(req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "User updated successfully",
        data: user
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new UsersController();
