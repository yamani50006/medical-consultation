import { cn } from "../../utils/cn";

export default function Input({ label, id, error, className, required, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground/90">
      {label ? (
        <span>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </span>
      ) : null}
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-2xl border border-input/80 bg-background/80 px-4 text-sm shadow-sm outline-none transition-all duration-300",
          "focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
          "placeholder:text-muted-foreground/70 dark:bg-card/70",
          error && "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20",
          className
        )}
        {...props}
      />
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </label>
  );
}
