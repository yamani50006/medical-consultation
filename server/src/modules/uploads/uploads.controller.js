import ApiResponse from "../../core/base/ApiResponse.js";
import UploadsService from "./uploads.service.js";

class UploadsController {
  constructor() {
    this.uploadsService = new UploadsService();
  }

  uploadChatAttachment = async (req, res, next) => {
    try {
      const result = await this.uploadsService.uploadChatAttachment(req.user.userId, req.file);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Attachment uploaded successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  downloadChatAttachment = async (req, res, next) => {
    try {
      const result = await this.uploadsService.getAttachmentDownload(req.user.userId, req.params.id);
      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(result.fileName)}"`);
      return res.sendFile(result.filePath);
    } catch (error) {
      return next(error);
    }
  };
}

export default new UploadsController();
