import api from "../../api/axios";

export function updateCurrentUser(payload) {
  return api.patch("/users/me", payload);
}
