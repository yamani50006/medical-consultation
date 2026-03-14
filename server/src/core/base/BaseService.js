import { getPaginationParams } from "../utils/pagination.util.js";

export default class BaseService {
  getPagination(query) {
    return getPaginationParams(query);
  }
}
