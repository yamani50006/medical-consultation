import ApiResponse from "../base/ApiResponse.js";

export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: "Forbidden: insufficient permissions"
      });
    }

    return next();
  };
}
