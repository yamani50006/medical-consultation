import api from "../../api/axios";

export function getUserPresence(userId) {
  return api.get(`/presence/${userId}`);
}
