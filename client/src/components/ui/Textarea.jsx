import { cn } from "../../utils/cn";

export default function Textarea({ label, id, error, className, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground/90">
      {label ? <span>{label}</span> : null}
      <textarea
        id={id}
        className={cn(
          "min-h-32 w-full rounded-[22px] border border-input/80 bg-background/80 px-4 py-3 text-sm shadow-sm outline-none transition-all duration-300",
          "focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
          "placeholder:text-muted-foreground/70 dark:bg-card/70",
          className
        )}
        {...props}
      />
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </label>
  );
}
