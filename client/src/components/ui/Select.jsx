import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Select({ label, error, className, children, required, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground/90">
      {label ? (
        <span>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </span>
      ) : null}
      <div className="relative">
        <select
          className={cn(
            "h-12 w-full appearance-none rounded-2xl border border-input/80 bg-background/80 px-4 pr-11 text-sm shadow-sm outline-none transition-all duration-300",
            "focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
            "dark:bg-card/70",
            error && "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </label>
  );
}
