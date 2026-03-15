import ApiResponse from "../../core/base/ApiResponse.js";
import PresenceService from "./presence.service.js";

class PresenceController {
  constructor() {
    this.presenceService = new PresenceService();
  }

  getPresence = async (req, res, next) => {
    try {
      const presence = await this.presenceService.getPresence(req.params.userId);
      return ApiResponse.success(res, {
        message: "Presence fetched successfully",
        data: presence
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new PresenceController();
