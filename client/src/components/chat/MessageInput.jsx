import { Paperclip, SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import AttachmentPreview from "./AttachmentPreview";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { CHAT_MAX_ATTACHMENTS, CHAT_MAX_ATTACHMENT_SIZE_BYTES } from "../../features/chat/chat.constants";
import { getErrorMessage } from "../../utils/error";

function toDraftAttachment(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    sizeBytes: file.size,
    isImage: file.type.startsWith("image/"),
    file
  };
}

export default function MessageInput({ onSend, sending }) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFilesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const nextAttachments = [...attachments];

    try {
      selectedFiles.forEach((file) => {
        if (nextAttachments.length >= CHAT_MAX_ATTACHMENTS) {
          throw new Error("Too many attachments");
        }

        if (file.size > CHAT_MAX_ATTACHMENT_SIZE_BYTES) {
          throw new Error("Attachment exceeds the maximum allowed size");
        }

        nextAttachments.push(toDraftAttachment(file));
      });

      setAttachments(nextAttachments);
      setError("");
    } catch (error) {
      setError(getErrorMessage(error, "تعذر تجهيز المرفقات."));
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!body.trim() && !attachments.length) {
      setError("يجب إدخال نص أو مرفق للرسالة.");
      return;
    }

    try {
      await onSend({
        body,
        files: attachments.map((attachment) => attachment.file)
      });
      setBody("");
      setAttachments([]);
      setError("");
    } catch (error) {
      setError(error.message || "تعذر إرسال الرسالة.");
    }
  };

  return (
    <div className="space-y-4 border-t border-border/60 px-5 py-4">
      {attachments.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              removable
              onRemove={() => {
                setAttachments((current) => current.filter((item) => item.id !== attachment.id));
              }}
            />
          ))}
        </div>
      ) : null}

      <Textarea
        label="رسالتك"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!sending) {
              handleSubmit();
            }
          }
        }}
        placeholder="اكتب رسالة للطبيب أو المريض. استخدم Shift + Enter لسطر جديد."
        className="min-h-28"
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
            onChange={handleFilesSelected}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <Paperclip className="size-4" />
            إرفاق ملف
          </Button>
          <span>حتى {CHAT_MAX_ATTACHMENTS} ملفات وبحد أقصى 10MB لكل ملف</span>
        </div>

        <Button type="button" onClick={handleSubmit} disabled={sending || (!body.trim() && !attachments.length)}>
          <SendHorizontal className="size-4" />
          {sending ? "جارٍ الإرسال..." : "إرسال"}
        </Button>
      </div>
    </div>
  );
}
