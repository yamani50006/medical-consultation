import api from "../../api/axios";

export function createConversation(payload) {
  return api.post("/conversations", payload);
}

export function listConversations(params = {}) {
  return api.get("/conversations", { params });
}

export function getConversation(id) {
  return api.get(`/conversations/${id}`);
}

export function listConversationMessages(id, params = {}) {
  return api.get(`/conversations/${id}/messages`, { params });
}

export function sendConversationMessage(id, payload) {
  return api.post(`/conversations/${id}/messages`, payload);
}

export function markMessageSeen(id) {
  return api.post(`/messages/${id}/seen`);
}
