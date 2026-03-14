import api from "../../api/axios";

export function listGroups(params = {}) {
  return api.get("/groups", { params });
}

export function listMyGroups(params = {}) {
  return api.get("/groups/my", { params });
}

export function getGroup(id) {
  return api.get(`/groups/${id}`);
}

export function createGroup(payload) {
  return api.post("/groups", payload);
}

export function updateGroup(id, payload) {
  return api.patch(`/groups/${id}`, payload);
}

export function joinGroup(id) {
  return api.post(`/groups/${id}/join`);
}

export function createGroupPost(id, payload) {
  return api.post(`/groups/${id}/posts`, payload);
}

export function updateGroupPost(postId, payload) {
  return api.patch(`/groups/posts/${postId}`, payload);
}
