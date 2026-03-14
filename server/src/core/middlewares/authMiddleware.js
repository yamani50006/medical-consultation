import ApiResponse from "../base/ApiResponse.js";
import prisma from "../../config/db.js";
import { verifyToken } from "../utils/jwt.util.js";

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Unauthorized: missing or invalid token"
    });
  }

  try {
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: "Unauthorized: user not found"
      });
    }

    if (user.status !== "ACTIVE") {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: "Account is not active"
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };
    return next();
  } catch (error) {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Unauthorized: token expired or invalid"
    });
  }
}
