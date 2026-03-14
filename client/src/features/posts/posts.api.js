import api from "../../api/axios";

export function listPosts(params = {}) {
  return api.get("/posts", { params });
}

export function listMyPosts(params = {}) {
  return api.get("/posts/me", { params });
}

export function createPost(payload) {
  return api.post("/posts", payload);
}

export function updatePost(id, payload) {
  return api.patch(`/posts/${id}`, payload);
}

export function deletePost(id) {
  return api.delete(`/posts/${id}`);
}
