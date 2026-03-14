import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import ApiResponse from "../base/ApiResponse.js";
import AppError from "../errors/AppError.js";

export function notFoundMiddleware(req, res) {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`
  });
}

export function errorMiddleware(err, req, res, next) {
  if (err instanceof ZodError) {
    return ApiResponse.error(res, {
      statusCode: 422,
      message: "Validation failed",
      errors: err.flatten()
    });
  }

  if (err instanceof AppError) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.details
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return ApiResponse.error(res, {
        statusCode: 409,
        message: "Duplicate value violates a unique constraint"
      });
    }
  }

  if (err?.name === "PrismaClientInitializationError") {
    return ApiResponse.error(res, {
      statusCode: 503,
      message: "Database connection failed"
    });
  }

  console.error(err);

  return ApiResponse.error(res, {
    statusCode: 500,
    message: "Internal server error"
  });
}
