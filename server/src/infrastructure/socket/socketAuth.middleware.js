import prisma from "../../config/db.js";
import { verifyToken } from "../../core/utils/jwt.util.js";

function extractToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return authToken.replace(/^Bearer\s+/i, "");
  }

  const authorizationHeader = socket.handshake.headers?.authorization || "";
  const [, token] = authorizationHeader.split(" ");
  return token || null;
}

export async function socketAuthMiddleware(socket, next) {
  try {
    const token = extractToken(socket);
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        fullName: true
      }
    });

    if (!user || user.status !== "ACTIVE") {
      next(new Error("Unauthorized"));
      return;
    }

    socket.data.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.fullName
    };

    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
}
