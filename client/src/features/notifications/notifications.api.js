import api from "../../api/axios";

export function listMyNotifications(params = {}) {
  return api.get("/notifications/me", { params });
}

export function markNotificationAsRead(id) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllNotificationsAsRead() {
  return api.patch("/notifications/me/read-all");
}
