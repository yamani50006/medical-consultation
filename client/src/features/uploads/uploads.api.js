import api from "../../api/axios";

export function uploadChatAttachment(file) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/uploads/chat-attachment", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export function fetchChatAttachmentBlob(attachmentId) {
  return api.get(`/uploads/chat-attachment/${attachmentId}`, {
    responseType: "blob"
  });
}
