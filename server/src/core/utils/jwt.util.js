import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import AppError from "../errors/AppError.js";

export function signToken(payload, options = {}) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: options.expiresIn || env.jwtExpiresIn
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function signScopedToken(scope, payload, options = {}) {
  return signToken(
    {
      ...payload,
      scope
    },
    options
  );
}

export function verifyScopedToken(token, expectedScope) {
  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    throw new AppError("Invalid upload token", 401, "INVALID_SCOPED_TOKEN");
  }

  if (payload.scope !== expectedScope) {
    throw new AppError("Invalid upload token", 401, "INVALID_SCOPED_TOKEN");
  }

  return payload;
}
