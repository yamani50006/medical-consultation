export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly details?: unknown;

  constructor(message: string, options?: { code?: string; statusCode?: number; details?: unknown }) {
    super(message);
    this.name = "AppError";
    this.code = options?.code;
    this.statusCode = options?.statusCode;
    this.details = options?.details;
  }
}

