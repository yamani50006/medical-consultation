import AppError from "../errors/AppError.js";
import { getPaginationParams } from "../utils/pagination.util.js";

export default class BaseService {
  getPagination(query) {
    return getPaginationParams(query);
  }

  ensureFound(resource, message, code = "RESOURCE_NOT_FOUND") {
    if (!resource) {
      throw new AppError(message, 404, code);
    }

    return resource;
  }

  ensure(condition, message, statusCode = 400, code = "BAD_REQUEST", details = null) {
    if (!condition) {
      throw new AppError(message, statusCode, code, details);
    }
  }
}
