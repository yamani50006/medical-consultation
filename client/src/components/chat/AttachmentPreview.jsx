import { Download, FileText, Image as ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { formatFileSize } from "../../utils/file";
import { fetchChatAttachmentBlob } from "../../features/uploads/uploads.api";
import { cn } from "../../utils/cn";

function getAttachmentName(attachment) {
  return attachment.originalName || attachment.name || "مرفق";
}

export default function AttachmentPreview({ attachment, onRemove, removable = false, compact = false }) {
  const [previewUrl, setPreviewUrl] = useState(attachment.previewUrl || "");
  const isImage = Boolean(attachment.isImage || attachment.mimeType?.startsWith("image/"));
  const displayName = getAttachmentName(attachment);

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";

    const resolvePreview = async () => {
      if (attachment.previewUrl) {
        setPreviewUrl(attachment.previewUrl);
        return;
      }

      if (attachment.file && isImage) {
        objectUrl = URL.createObjectURL(attachment.file);
        if (isActive) {
          setPreviewUrl(objectUrl);
        }
        return;
      }

      if (attachment.id && isImage) {
        try {
          const response = await fetchChatAttachmentBlob(attachment.id);
          objectUrl = URL.createObjectURL(response.data);
          if (isActive) {
            setPreviewUrl(objectUrl);
          }
        } catch (error) {
          if (isActive) {
            setPreviewUrl("");
          }
        }
      }
    };

    resolvePreview();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment.file, attachment.id, attachment.previewUrl, isImage]);

  const handleDownload = async () => {
    if (attachment.file) {
      const localUrl = URL.createObjectURL(attachment.file);
      const anchor = document.createElement("a");
      anchor.href = localUrl;
      anchor.download = displayName;
      anchor.click();
      URL.revokeObjectURL(localUrl);
      return;
    }

    if (!attachment.id) {
      return;
    }

    const response = await fetchChatAttachmentBlob(attachment.id);
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = displayName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "rounded-[22px] border border-border/60 bg-card/65 p-3",
        compact ? "space-y-2" : "space-y-3"
      )}
    >
      {isImage && previewUrl ? (
        <div className="overflow-hidden rounded-[18px] border border-border/50 bg-muted/20">
          <img src={previewUrl} alt={displayName} className="max-h-56 w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[18px] bg-secondary/60 px-3 py-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            {isImage ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatFileSize(attachment.sizeBytes || attachment.file?.size || 0)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.sizeBytes || attachment.file?.size || 0)}</p>
        </div>
        <div className="flex items-center gap-2">
          {!removable ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="size-4" />
              تنزيل
            </Button>
          ) : null}
          {removable && onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-colors duration-200 hover:text-destructive"
              aria-label={`إزالة ${displayName}`}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
