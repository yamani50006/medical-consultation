import { AppError } from "@/core/errors/AppError";

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, { code: "UNAUTHORIZED", statusCode: 401 });
    this.name = "UnauthorizedError";
  }
}

