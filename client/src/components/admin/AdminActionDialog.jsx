import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

export default function AdminActionDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "primary",
  onClose,
  onConfirm,
  requireReason = false,
  includeTitle = false
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [warningTitle, setWarningTitle] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setNote("");
      setWarningTitle("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-xl border-white/35 bg-card/45 shadow-[0_40px_120px_-48px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-card/35">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {includeTitle ? (
            <Input value={warningTitle} onChange={(event) => setWarningTitle(event.target.value)} placeholder="عنوان الرسالة" />
          ) : null}
          {requireReason ? (
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="السبب" />
          ) : null}
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={includeTitle ? "رسالة التنبيه" : "ملاحظة إدارية اختيارية"}
            rows={4}
          />
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={() =>
                onConfirm({
                  ...(includeTitle ? { title: warningTitle } : {}),
                  ...(requireReason ? { reason } : {}),
                  note,
                  ...(includeTitle ? { message: note } : {})
                })
              }
              disabled={(requireReason && !reason.trim()) || (includeTitle && (!warningTitle.trim() || !note.trim()))}
            >
              {confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
